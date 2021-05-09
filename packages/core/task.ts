import { Page } from "playwright-chromium";
import {
  sleep,
  navigateToClassProfile,
  openClassProfileSidebar,
  collectFromClassProfile,
} from "./utils";
import { CLASS_PROFILE_TASK } from "./selectors";
import { LoginContext } from "./login";

export type Task = {
  groupName?: string; //課題グループ名;
  name?: string; //課題名;
  course?: string; //コース;
  when?: string; //目次;
  start?: string; //課題提出開始日時;
  deadline?: string; //課題提出終了日時;
  method?: string; //提出方法;
  status?: string; //ステータス;
  unsubmitted?: string; //未提出;
  submitTimes?: string; //提出回数;
  submitLimit?: string; //再提出回数;
  submitDeadline?: string; //再提出期限;
  submitTime?: string; //提出日時;
  score?: string; //点数;
  uncheck?: string; //未確認;
  upVotes?: string; // 👍
  downVotes?: string; // 👎
  otherSubmitters?: string; //他の提出者;
};

export type TaskMap = Record<string, Task[]>;

export type Attachment = {
  title: string;
  url?: string;
};

export async function getTasks(
  { page }: LoginContext,
  q = 1
): Promise<TaskMap> {
  await navigateToClassProfile(page);

  let pageIndex = 0;
  while (pageIndex < q - 1) {
    await page.click("#funcLeftForm\\:j_idt196");
    await sleep(500);
    pageIndex++;
  }

  await openClassProfileSidebar(page);

  await page.click(CLASS_PROFILE_TASK);
  await sleep(500);

  const tasksMap: TaskMap = {};

  await collectFromClassProfile(page, async (page, title) => {
    const tasks = await collectClassTasks(page);
    tasksMap[title] = tasks;
  });

  return tasksMap;
}

async function collectClassTasks(page: Page): Promise<Task[]> {
  // console.log(`goto page`);
  const taskRows = await page.$$("#funcForm\\:gakKdiTstList_data > tr");
  const tasks: Task[] = [];
  let i = 0;
  for (const _ of taskRows) {
    // console.log(`work on row`);
    const rows = await page.$$("#funcForm\\:gakKdiTstList_data > tr");
    const row = rows[i];
    const task = await row.$$eval("td", (tds) => {
      const textContentOf = (e?: Element | null) =>
        e?.textContent?.trim() ?? "";

      const [
        groupName,
        name,
        course,
        when,
        start,
        deadline,
        method,
        status,
        unsubmitted,
        submitTimes,
        submitLimit,
        submitDeadline,
        submitTime,
        score,
        uncheck,
        upVotes,
        downVotes,
        otherSubmitters,
      ] = tds.map(textContentOf);

      return {
        groupName,
        name,
        course,
        when,
        start,
        deadline,
        method,
        status,
        unsubmitted,
        submitTimes,
        submitLimit,
        submitDeadline,
        submitTime,
        score,
        uncheck,
        upVotes,
        downVotes,
        otherSubmitters,
      };
    });
    if (task.start) {
      tasks.push(task);
    }
    i++;
    // console.log(`end work on row`);
  }
  return tasks;
}
