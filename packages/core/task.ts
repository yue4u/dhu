import { Page } from "playwright-chromium";
import { sleep, waitForClickNavigation } from "./utils";
import { CLASS_PROFILE, CLASS_PROFILE_TASK } from "./selectors";

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

export async function getTasks(page: Page, q: number = 1): Promise<TaskMap> {
  await waitForClickNavigation(page, CLASS_PROFILE);
  let pageIndex = 0;
  while (pageIndex < q - 1) {
    await page.click(`#funcLeftForm\\:j_idt196`);
    await sleep(500);
    pageIndex++;
  }
  await page.evaluate(() => {
    Array.from(
      document.querySelectorAll<HTMLElement>(".ui-icon-plusthick")
    ).forEach((e) => e.click());
  });
  await sleep(500);
  await page.click(CLASS_PROFILE_TASK);
  await sleep(500);
  const classes = await page.$$(".classList a");
  let tasksMap: Record<string, Task[]> = {};
  let i = 0;
  for (const _ of classes) {
    let handles = await page.$$(".classList a");
    let handle = handles[i];

    const title = await handle.textContent();
    await handle.click();
    await sleep(1000);

    // console.log(`start ${title}`);
    const tasks = await getClassTasks(page);
    tasksMap[title ?? ""] = tasks;
    i++;
    // console.log(`end ${title}`);
  }
  return tasksMap;
}

async function getClassTasks(page: Page): Promise<Task[]> {
  // console.log(`goto page`);
  const taskRows = await page.$$(`#funcForm\\:gakKdiTstList_data > tr`);
  let tasks: Task[] = [];
  let i = 0;
  for (const _ of taskRows) {
    // console.log(`work on row`);
    const rows = await page.$$(`#funcForm\\:gakKdiTstList_data > tr`);
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
