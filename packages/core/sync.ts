import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { withLogin } from "./login";
import { getMaterials } from "./materials";
import { getInfo } from "./info";
import { getUserInfo } from "./userInfo";
import { navigateToTop, HandleAttachmentOptions } from "./utils";

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
    return path.join(classPath, `${name}.md`);
  },
  async getInfoPath() {
    const infoPath = path.join(this.dir, "info");
    await fs.ensureDir(infoPath);
    return infoPath;
  },
  async getInfoMarkdownPath(name: string) {
    return path.join(await this.getInfoPath(), `${name}.md`);
  },
  async getDownloadOptions(): Promise<HandleAttachmentOptions> {
    return { download: true, dir: this.dir };
  },
  async writeFile(path: string, content: string) {
    await fs.writeFile(path, content, {
      encoding: "utf-8",
    });
  },
  log(type: "info" | "common" | "material" | "download", info?: string) {
    console.log(chalk`{yellow syncing({cyan ${type}})}: ${info}`);
  },
};

export async function syncAll(dir?: string) {
  const userInfo = await getUserInfo();
  if (!userInfo) return;
  const syncDir = dir ?? userInfo.config?.syncDir;
  if (syncDir) {
    syncUtils.setDir(syncDir);
  }
  const downloadOptions = await syncUtils.getDownloadOptions();
  syncUtils.log("common", chalk`syncing with {cyan ${syncDir}}`);
  await withLogin(
    async (ctx) => {
      await getMaterials(ctx, downloadOptions);
      await navigateToTop(ctx.page);
      await getInfo(ctx, {
        content: true,
        skipRead: false,
        attachments: downloadOptions,
      });
    },
    { headless: false }
  );
}
