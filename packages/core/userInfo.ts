import os from "os";
import path from "path";
import fs from "fs-extra";

export type LoginInfo = {
  id: string;
  password: string;
};

export interface SavedInfo extends LoginInfo {
  config?: Config;
}

export const configKeys = new Set(["syncDir"]);

export interface Config {
  syncDir?: string;
}

function getUserDataPath() {
  const dataPath =
    process.env.APPDATA ||
    os.homedir() +
      (process.platform == "darwin" ? "/Library/Preferences" : "/.local/share");
  return path.join(dataPath, "dhu", "config.json");
}

export async function saveUserInfo(info: SavedInfo) {
  const userDataPath = getUserDataPath();
  const userDataPathDir = path.dirname(userDataPath);

  await fs.ensureDir(userDataPathDir);
  await fs.writeJSON(userDataPath, info, {
    encoding: "utf8",
  });

  console.log(`user info saved to ${userDataPath}`);
}

export async function getUserInfo(): Promise<SavedInfo | null> {
  try {
    return readUserInfo();
  } catch {
    return null;
  }
}

export async function getUserConfig(): Promise<Config | undefined | null> {
  const userInfo = await getUserInfo();
  return userInfo?.config;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateUserConfig(key: string, value: any) {
  const userInfo = await getUserInfo();
  if (!userInfo) {
    console.log("userInfo not found, try `dhu login first`");
    return;
  }
  return saveUserInfo({
    ...userInfo,
    config: {
      ...userInfo.config,
      [key]: value,
    },
  });
}

export async function readUserInfo(): Promise<SavedInfo> {
  const content = await fs.readFile(getUserDataPath(), { encoding: "utf8" });
  return JSON.parse(content) as SavedInfo;
}

export async function removeUserInfo(): Promise<void> {
  return fs.unlink(getUserDataPath());
}
