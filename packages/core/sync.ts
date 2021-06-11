import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { LaunchOptions } from "playwright-chromium";
import { withLogin } from "./login";
import { getMaterials } from "./materials";
import { getInfo } from "./info";
import { getUserInfo } from "./userInfo";
import { HandleAttachmentOptions } from "./utils";
import { navigate } from "./navigate";
import { getTasks } from "./task";

export const syncUtils = {
  dir: process.cwd(),
  setDir(dir: string) {
    this.dir = dir;
  },
  async getClassPath(title: string) {
    const classPath = path.join(this.dir, "class", title);
    await fs.ensureDir(classPath);
    return classPath;
  },
  async getClassMarkdownPath(classPath: string, name: string) {
    return path.join(classPath, `${name.replaceAll("/", "-")}.md`);
  },
  async getInfoPath() {
    const infoPath = path.join(this.dir, "info");
    await fs.ensureDir(infoPath);
    return infoPath;
  },
  async getInfoMarkdownPath(name: string) {
    return path.join(
      await this.getInfoPath(),
      `${name.replaceAll("/", "-")}.md`
    );
  },
  async getDownloadOptions(): Promise<HandleAttachmentOptions> {
    return { download: true, dir: this.dir };
  },
  async writeFile(path: string, content: string) {
    await fs.writeFile(path, content, {
      encoding: "utf-8",
    });
  },
  async skipOrWriteFile(path: string, fn: () => string) {
    if (await fs.pathExists(path)) {
      this.log("info", `skip ${path}`);
    } else {
      this.log("info", path);
      await syncUtils.writeFile(path, fn());
    }
  },
  log(type: "info" | "common" | "material" | "download", info?: string) {
    console.log(chalk`{yellow syncing({cyan ${type}})}: ${info}`);
  },
};

export async function syncAll(dir?: string, options?: LaunchOptions) {
  const userInfo = await getUserInfo();
  if (!userInfo) return;
  const syncDir = dir ?? userInfo.config?.syncDir;
  if (syncDir) {
    syncUtils.setDir(syncDir);
  }
  const downloadOptions = await syncUtils.getDownloadOptions();
  syncUtils.log("common", chalk`syncing with {cyan ${syncDir}}`);
  await fs.ensureDir(await syncUtils.getInfoPath());
  await withLogin(
    async (ctx) => {
      await getTasks(ctx, 1, true);
      await navigate(ctx.page).to("top");
      await getMaterials(ctx, downloadOptions);
      await navigate(ctx.page).to("top");
      await getInfo(ctx, {
        content: true,
        skipRead: false,
        sync: true,
        attachments: downloadOptions,
      });
    },
    { headless: true, ...options }
  );
}
