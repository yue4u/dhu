import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { format } from "date-fns";
import { LaunchOptions } from "playwright-chromium";
import { withLogin } from "./login";
import { getMaterials } from "./materials";
import { getInfo } from "./info";
import { getUserData } from "./userData";
import { Head, Tail } from "./utils";
import { navigate } from "./navigate";
import { getTasks } from "./task";

type SyncInfo = {
  update: string;
};

type SyncManifest = Record<string, SyncInfo>;

type JoinPath<A, B> = A extends string
  ? B extends string
    ? `${A}/${B}`
    : never
  : never;

type SyncPathFrom<T extends readonly unknown[]> = Head<Tail<T>> extends never
  ? Head<T>
  : JoinPath<Head<T>, SyncPathFrom<Tail<T>>>;

export const sync = {
  dir: null as null | string,
  // use dir if provided, or use user info, or fallback to current dir
  async updateDir(dir?: string) {
    sync.dir = dir ?? (await getUserData())?.config?.syncDir ?? process.cwd();
    sync.log("common", chalk`syncing with {cyan ${sync.dir}}`);
  },

  log(type: "info" | "common" | "material" | "download", info?: string) {
    console.log(chalk`{yellow syncing({cyan ${type}})}: ${info}`);
  },

  file: {
    name: {
      format: "yyyy-MM-dd-HH-mm-ss",
      getPrefix() {
        return `${format(Date.now(), sync.file.name.format)}--` as const;
      },
      normalize(name = "no-title") {
        return `${name.replaceAll("/", "-")}` as const;
      },
      getOrigin(name: string) {
        let origin = name;
        // TODO: this is too board. narrow this
        const [maybePrefix, extra] = name.split("--", 1);
        if (extra && maybePrefix.length === sync.file.name.format.length) {
          origin = extra;
        }
        origin = origin
          .replace(".md", "")
          .replace(".pdf", "")
          .replace(".doc", "");
        return origin;
      },
    },

    async write(target: string, content: string) {
      const targetPath = sync.getPath(target);
      await fs.ensureFile(targetPath);
      await fs.writeFile(targetPath, content, {
        encoding: "utf-8",
      });
    },

    async skipOrWrite({
      name,
      ext = "",
      content,
      dir,
    }: {
      name?: string;
      ext?: string;
      content: () => string | Promise<string>;
      dir: string[];
    }): Promise<boolean> {
      const normalizedName = sync.file.name.normalize(name);
      const checkName = path.join(...dir, normalizedName);
      if (sync.manifest.data?.[checkName]) {
        sync.log("info", `skipping ${checkName}`);
        return false;
      }

      sync.log("download", checkName);
      sync.manifest.addCheckEntry(checkName);
      await sync.file.write(
        path.join(
          ...dir,
          `${sync.file.name.getPrefix()}${normalizedName}${ext}`
        ),
        await content()
      );
      return true;
    },
  },

  joinPath<P extends string[]>(...paths: P): SyncPathFrom<P> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return path.join(...paths) as any;
  },

  getPath<P extends string[]>(...paths: P): SyncPathFrom<["$DIR", ...P]> {
    if (!sync.dir) throw new Error("base path not been set");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return path.join(sync.dir, ...paths) as any;
  },

  manifest: {
    data: null as SyncManifest | null,
    updates: {} as SyncManifest,
    async load() {
      sync.manifest.data = await sync.manifest.read();
    },
    getPath() {
      return sync.getPath("sync-manifest.json");
    },

    async read(): Promise<SyncManifest | null> {
      const syncManifestPath = sync.manifest.getPath();
      return fs.readJSON(syncManifestPath).catch(() => null);
    },

    async write() {
      sync.log(
        "info",
        `updates: ${JSON.stringify(sync.manifest.updates, null, 4)}`
      );
      const syncManifestPath = sync.manifest.getPath();
      await fs.ensureFile(syncManifestPath);
      const manifest = {
        ...sync.manifest.data,
        ...sync.manifest.updates,
      };

      return fs.writeFile(syncManifestPath, JSON.stringify(manifest, null, 4), {
        encoding: "utf-8",
      });
    },

    addCheckEntry(name: string) {
      sync.manifest.updates[name] = { update: new Date().toISOString() };
    },

    async generateFromLocal(): Promise<SyncManifest> {
      const [classes, info] = await Promise.all([
        collectClass(),
        collectInfo(),
      ]);

      return Object.fromEntries([...classes, ...info]);

      async function collectClass(): Promise<[string, SyncInfo][]> {
        if (!sync.dir) throw new Error("base path not been set");
        const classCollectionPath = sync.getPath("class");
        const classNames = await fs.readdir(classCollectionPath);
        const allClassesWithStat = await Promise.all(
          classNames.flatMap(async (className) => {
            const classPath = sync.class.getPath(className);
            const classesFiles = await fs.readdir(classPath);
            const classesFilesWithStat = await Promise.all(
              classesFiles.flatMap(async (filename) => {
                const stat = await fs.stat(path.join(classPath, filename));
                return [
                  `${className}/${sync.file.name.getOrigin(filename)}`,
                  { update: stat.ctime.toISOString() },
                ];
              })
            );
            return classesFilesWithStat.flatMap(([filename, stat]) => [
              `class/${filename}`,
              stat,
            ]);
          })
        );
        // @ts-ignore
        return allClassesWithStat;
      }

      async function collectInfo(): Promise<[string, SyncInfo][]> {
        if (!sync.dir) throw new Error("base path not been set");
        const infoPath = sync.getPath("info");
        const infos = await fs.readdir(infoPath);
        const infosWithStat = await Promise.all(
          infos.map(async (filename) => {
            const stat = await fs.stat(path.join(infoPath, filename));
            return [
              `info/${sync.file.name.getOrigin(filename)}`,
              { update: stat.ctime.toISOString() },
            ];
          })
        );
        // @ts-ignore
        return infosWithStat;
      }
    },
  },

  class: {
    getPath(className: string) {
      return sync.getPath("class", className);
    },
  },

  info: {
    getPath() {
      return sync.getPath("info");
    },
  },
};

export async function syncAll(dir?: string, options?: LaunchOptions) {
  await sync.updateDir(dir);
  await sync.manifest.load();

  await withLogin(
    async (ctx) => {
      await getTasks(ctx, 1, { sync: true });
      await navigate(ctx.page).to("top");
      // dir has been set
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await getMaterials(ctx, { download: true, dir: sync.dir! });
      await navigate(ctx.page).to("top");
      await getInfo(ctx, {
        content: true,
        skipRead: false,
        sync: true,
        attachmentOptions: { download: true, dir: sync.info.getPath() },
      });
    },
    { headless: true, ...options }
  );

  await sync.manifest.write();
}
