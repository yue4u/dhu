import os from "os";
import path from "path";
import readline from "readline";
import { promises as fs } from "fs";
import { chromium, Page } from "playwright";
import { URL, LOGIN, NAV } from "./selectors";

type LoginOptions = {
  id: string;
  password: string;
};

export async function login() {
  const { id, password } = await getUserInfo();
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(URL.TOP);

  await page.type(LOGIN.ID, id);
  await page.type(LOGIN.PASSWORD, password);
  await page.click(LOGIN.SUBMIT_BUTTON);

  return { page, browser };
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
  const subjects = await page.$$eval(subjectSelector, (es) =>
    es.map((e) => {
      const codeAndTitle = e.textContent ?? "";
      const code = codeAndTitle.substring(0, 8);
      const title = codeAndTitle.substring(8);
      return {
        code,
        title,
      };
    })
  );

  const attendanceRows = await page.$$eval(attendanceRowSelector, (es) => {
    const m = {
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

    return es.map((e) => {
      const tds = Array.from(e.querySelectorAll("td"));
      const records = tds
        .filter((_, i) => i > 2)
        .map((e) => {
          const statusMark = e.querySelector("span")?.textContent?.trim() ?? "";
          const status = m[statusMark as AttendanceRecordMark];
          const date = e.querySelector("p")?.textContent?.trim() ?? "";
          return { status, date };
        });
      const rate = tds[2].textContent?.trim() ?? "";
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

async function saveUserInfo(info: LoginOptions) {
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

async function getUserInfo(): Promise<LoginOptions> {
  try {
    const content = await fs.readFile(getUserDataPath(), { encoding: "utf8" });
    return JSON.parse(content) as LoginOptions;
  } catch {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question("digicam id? ", (id) => {
        rl.question("password ? ", async (password) => {
          const info = { id, password };
          await saveUserInfo(info);
          resolve(info);
          rl.close();
        });
      });
    });
  }
}
