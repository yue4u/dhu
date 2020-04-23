import os from "os";
import path from "path";
import readline from "readline";
import { promises as fs } from "fs";
import {
  chromium,
  ChromiumBrowserContext,
  Page,
  BrowserTypeLaunchOptions,
} from "playwright";
import { URL, LOGIN, NAV } from "./selectors";

export type LoginOption = {
  headless?: boolean;
};

export type LoginInfo = {
  id: string;
  password: string;
};

const sleep = (timeout: number) => {
  return new Promise((done) => setTimeout(done, timeout));
};

const textContentOf = (e?: Element | null) => e?.textContent?.trim() ?? "";

export async function login(option?: BrowserTypeLaunchOptions) {
  const { id, password } = await getUserInfo();
  const browser = await chromium.launch(option);
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(URL.TOP);
  await exposeHelper(ctx);

  // if(maintenance){
  //   // TODO
  // }

  await page.type(LOGIN.ID, id);
  await page.type(LOGIN.PASSWORD, password);
  await Promise.all([
    page.waitForNavigation(),
    page.click(LOGIN.SUBMIT_BUTTON),
  ]);
  const err = await page.evaluate(() => {
    const e = document.querySelector(".ui-messages-error-detail");
    return e === null ? e : textContentOf(e);
  });

  if (err) {
    console.error(err);
    await removeUserInfo();
    process.exit();
  }
  return { page, browser };
}

export async function exposeHelper(ctx: ChromiumBrowserContext) {
  await ctx.exposeFunction("getAttendanceStatusMap", getAttendanceStatusMap);
  await ctx.exposeFunction("textContentOf", textContentOf);
}

export type Attendance = {
  code: string;
  title: string;
  rate: string;
  records: AttendanceRecord[];
};

export const AttendanceStatusMap = {
  〇: "出席",
  "▽": "早退",
  "△": "遅刻",
  "×": "欠席",
  公: "公欠",
  休: "休講",
  "－": "授業対象外",
  外: "試験対象外",
  "": "期試験/追試験/再試験",
} as const;

const getAttendanceStatusMap = () => AttendanceStatusMap;

export type AttendanceRecordMark = keyof typeof AttendanceStatusMap;
export type AttendanceRecord = {
  status: typeof AttendanceStatusMap[AttendanceRecordMark];
  date: string;
};

export async function getAttendance(page: Page): Promise<Attendance[]> {
  await page.click(NAV.TAB);
  await page.click(NAV.ATTENDANCE);
  const subjectSelector = `div.scroll_div:nth-child(1) > table:nth-child(1) > tbody:nth-child(2) > tr > td:nth-child(2)`;
  const attendanceRowSelector = `div.scroll_div:nth-child(1) > table:nth-child(1) > tbody:nth-child(2) > tr`;
  const subjects = await page.$$eval(subjectSelector, (es) => {
    return es.map((e) => {
      const codeAndTitle = textContentOf(e);
      const code = codeAndTitle.substring(0, 8);
      const title = codeAndTitle.substring(8);
      return {
        code,
        title,
      };
    });
  });
  const attendanceRows = await page.$$eval(attendanceRowSelector, (es) => {
    return es.map((e) => {
      const tds = Array.from(e.querySelectorAll("td"));
      const records = tds
        .filter((_, i) => i > 2)
        .map((e) => {
          const statusMark = textContentOf(e.querySelector("span"));
          const status = getAttendanceStatusMap()[
            statusMark as AttendanceRecordMark
          ];
          const date = textContentOf(e.querySelector("p"));
          return { status, date };
        });
      const rate = textContentOf(tds[2]);
      return { rate, records };
    });
  });

  return subjects.map((subject, i) => ({ ...subject, ...attendanceRows[i] }));
}

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
