import os from "os";
import path from "path";
import fs from "fs-extra";
import type { ZoomInfo } from "./zoom";

export type LoginInfo = {
  id: string;
  password: string;
};

export interface UserData {
  user?: LoginInfo;
  config?: Config;
  zoom?: ZoomInfo[];
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

async function saveUserData(info: UserData) {
  const userDataPath = getUserDataPath();
  const userDataPathDir = path.dirname(userDataPath);

  await fs.ensureDir(userDataPathDir);
  await fs.writeJSON(userDataPath, info, {
    encoding: "utf8",
  });

  console.log(`user info saved to ${userDataPath}`);
}

export async function getUserData(): Promise<UserData | null> {
  return fs.readJSON(getUserDataPath()).catch(() => null);
}

export async function updateUserData(
  updateFn: (data: Partial<UserData>) => void
) {
  const saved = (await getUserData()) || {};
  updateFn(saved);
  console.log(saved);
  return saveUserData(saved as Partial<UserData>);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateUserConfig(key: string, value: any) {
  return updateUserData((data) => {
    data.config = {
      ...data.config,
      [key]: value,
    };
  });
}

export async function removeUserInfo(): Promise<void> {
  return fs.unlink(getUserDataPath());
}
