import { Page, ElementHandle } from "playwright-chromium";
import { sleep } from "../utils";
import { NAV_COURSE, NAV_SYLLABUS_LINK, COURSE_ITEM_CLOSE } from "../selectors";
import { navigate } from "../navigate";

export type Course = {
  code: string;
  title: string;
  start: string;
  category: string;
  field: string;
  teacher: string;
  practicalTeacher: string;
  year: string;
  credit: string;
  time: string;

  target: string;
  purpose: string;
  requirements: string;
  requirementsAdjusted: string;
  gradePolicy: string;
  finalTest: string;
  task: string;
  contents?: string[];

  textbooks?: Textbook[];

  thingsToPrepare: string;
  references: string;
  message: string;
  contact: string;
};

export type Textbook = {
  name: string;
  author: string;
  publisher: string;
  ISBN: string;
  note: string;
};

// prettier-ignore
const SYLLABUS_OPEN_URL = "https://portal.dhw.ac.jp/uprx/up/pk/pky001/Pky00101.xhtml?guestlogin=Kmh006";

export async function getTotalCourseNumber(page: Page) {
  await navigate(page).byGoto(SYLLABUS_OPEN_URL);
  await page.selectOption("#funcForm\\:kaikoGakki_input", "");
  await page.selectOption("#funcForm\\:kaikoGakki_input", "");
  await page.click("#funcForm\\:search");
  await sleep(2000);
  const totalEl = await page.$(".ui-paginator-current");
  const totalText = await totalEl?.textContent();
  const [count] = totalText?.match(/([0-9]+)/) ?? [];
  return count;
}

export async function getOpenSyllabus(page: Page): Promise<Course[]> {
  await navigate(page).byGoto(SYLLABUS_OPEN_URL);
  console.log("setting options...");
  await sleep(200);
  await page.selectOption("#funcForm\\:kaikoGakki_input", "");
  await page.click("#funcForm\\:search");
  await sleep(2000);
  console.log("start gathering...");
  return gatherCourseFromPage(page);
}

export async function getSyllabus(page: Page): Promise<Course[]> {
  await page.click(NAV_COURSE);
  await navigate(page).byClick(NAV_SYLLABUS_LINK);
  console.log("setting options...");
  await page.selectOption("#funcForm\\:cgksSearchType0_input", "");
  await page.selectOption("#funcForm\\:kaikoGakki_input", "");
  await page.click("#funcForm\\:search");
  await page.selectOption("#funcForm\\:table_rppDD", "100");
  await sleep(2000);
  console.log("start gathering...");
  return gatherCourseFromPage(page);
}

async function gatherCourseFromPage(page: Page) {
  const courses: Course[] = [];
  let pageIndex = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let i = 0;
    let links = await page.$$("tr.ui-widget-content  a");
    if (links?.length === i) {
      break;
    }
    if (!links?.length) {
      break;
    }
    for (const _ in links) {
      console.log(`page ${pageIndex} course ${i + 1}`);
      const link = links[i];
      const course = await handleCourseLink(page, link);
      //console.log(course);
      courses.push(course);
      i++;
      links = await page.$$("tr.ui-widget-content  a");
    }
    const next = await page.$eval(
      "#funcForm\\:table_paginator_bottom > .ui-paginator-next",
      (e: HTMLElement) => {
        if (e.classList.contains("ui-state-disabled")) {
          return false;
        } else {
          e.click();
          return true;
        }
      }
    );
    if (!next) {
      break;
    }
    pageIndex++;
    await sleep(1000);
  }
  return courses;
}

const handleCourseLink = async (
  page: Page,
  link: ElementHandle
): Promise<Course> => {
  const text = await link?.textContent();
  console.log(`click ${text}`);
  await link.click();
  await sleep(500);

  const courseData = await page.$$eval(".fr-box", (boxes) => {
    const textContentOf = (e?: Element | null) => e?.textContent?.trim() ?? "";
    return boxes.map(textContentOf);
  });

  const contents = await page.$$eval(
    ".rowStyle:not(.rowMargin) > div.colStyle.colNoBorder",
    (rows) => {
      const textContentOf = (e?: Element | null) =>
        e?.textContent?.trim() ?? "";
      return rows.map(textContentOf);
    }
  );
  const [
    code,
    title,
    start,
    category,
    field,
    teacher,
    practicalTeacher,
    year,
    credit,
    time,

    target,
    purpose,
    requirements,
    requirementsAdjusted,
    gradePolicy,
    finalTest,
    task,
  ] = courseData;

  const [thingsToPrepare, references, message, contact] = courseData.slice(
    courseData.length - 4
  );

  const textbooks: Textbook[] = await page.$$eval(
    ".rowStyle.rowMargin",
    (els) => {
      const textbooksData: Textbook[] = [];
      const textContentOf = (e?: Element | null) =>
        e?.textContent?.trim() ?? "";

      for (const e of els.reverse().slice(5)) {
        const details = Array.from(e.querySelectorAll("div"));
        if (details?.length !== 5) {
          break;
        }

        const [name, author, publisher, ISBN, note] =
          details.map(textContentOf);
        textbooksData.push({
          name,
          author,
          publisher,
          ISBN,
          note,
        });
      }
      textbooksData.pop();
      return textbooksData;
    }
  );
  // console.log({textbooks})

  await page.click(COURSE_ITEM_CLOSE);
  await sleep(500);
  return {
    code,
    title,
    start,
    category,
    field,
    teacher,
    practicalTeacher,
    year,
    credit,
    time,

    target,
    purpose,
    requirements,
    requirementsAdjusted,
    gradePolicy,
    finalTest,
    task,

    contents,
    textbooks,

    thingsToPrepare,
    references,
    message,
    contact,
  };
};
