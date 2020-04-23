import os from "os";
import path from "path";
import readline from "readline";
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

  return await fs.writeFile(userDataPath, JSON.stringify(info), {
    encoding: "utf8",
  });
}

export async function getUserInfo(): Promise<LoginInfo> {
  try {
    return await readUserInfo();
  } catch {
    return await askUserInfo();
  }
}

export async function readUserInfo(): Promise<LoginInfo> {
  const content = await fs.readFile(getUserDataPath(), { encoding: "utf8" });
  return JSON.parse(content) as LoginInfo;
}

export async function removeUserInfo(): Promise<void> {
  return fs.unlink(getUserDataPath());
}

export async function askUserInfo(): Promise<LoginInfo> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (question: string): Promise<string> => {
    return new Promise((resolve) =>
      rl.question(`${question} `, (answer) => resolve(answer))
    );
  };
  const id = await ask("digicam id?");
  const password = await ask("password?");

  rl.close();

  const info = { id, password };
  await saveUserInfo(info);
  return info;
}
