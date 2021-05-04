import os from "os";
import path from "path";
import { promises as fs } from "fs";

export type LoginInfo = {
  id: string;
  password: string;
};

function getUserDataPath() {
  let dataPath =
    process.env.APPDATA ||
    os.homedir() +
      (process.platform == "darwin" ? "/Library/Preferences" : "/.local/share");
  return path.join(dataPath, "dhu", "config.json");
}

export async function saveUserInfo(info: LoginInfo) {
  const userDataPath = getUserDataPath();
  const userDataPathDir = path.dirname(userDataPath);
  const stat = await fs.stat(userDataPathDir).catch(() => false);

  if (!stat) {
    await fs.mkdir(userDataPathDir, { recursive: true });
  }

  await fs.writeFile(userDataPath, JSON.stringify(info), {
    encoding: "utf8",
  });

  console.log(`user info saved to ${userDataPath}`);
}

export async function getUserInfo(): Promise<LoginInfo | null> {
  try {
    return await readUserInfo();
  } catch {
    return null;
  }
}

export async function readUserInfo(): Promise<LoginInfo> {
  const content = await fs.readFile(getUserDataPath(), { encoding: "utf8" });
  return JSON.parse(content) as LoginInfo;
}

export async function removeUserInfo(): Promise<void> {
  return fs.unlink(getUserDataPath());
}
