import { Page } from "playwright-chromium";
import { NAV_INFO, NAV_FS_LINK, CONFIRM_BUTTON } from "./selectors";
import { waitForClickNavigation, sleep } from "./utils";
import { LoginContext, Result } from "./login";

export type FS = {
  title: string;
  sender: string;
  status: string;
  deadline: string;
};
const FS_ROW = "tr.ui-widget-content";

export async function getFS({ page }: LoginContext): Promise<FS[]> {
  await page.click(NAV_INFO);
  await waitForClickNavigation(page, NAV_FS_LINK);

  const FSList = await page.$$eval(FS_ROW, (rows) => {
    const textContentOf = (e?: Element | null) => e?.textContent?.trim() ?? "";

    return rows
      .map((row) => {
        return Array.from(row.querySelectorAll("td")).map(textContentOf);
      })
      .filter((row) => row.length === 4)
      .map((row) => {
        const [title, sender, status, deadline] = row;
        return {
          title,
          sender,
          status,
          deadline,
        };
      });
  });
  return FSList;
}

export const FS_QUESTIONS = [
  {
    type: "select",
    text: "授業内容を理解できましたか?",
    options: [
      { label: "理解できた", value: 0 },
      { label: "よく解らなかった", value: 1 },
    ],
  },
  {
    type: "input",
    text: "よく解らなかったと記入した方で、授業へのご要望があれば教えてください。",
  },
  {
    type: "select",
    text: "授業の進行スピードについて教えてください",
    options: [
      { label: "早かった", value: 2 },
      { label: "適切だった", value: 3 },
      { label: "遅かった", value: 4 },
    ],
  },
  {
    type: "select",
    text: "今回の授業にどのような感想をもちましたか？",
    options: [
      { label: "新しい発見があった", value: 5 },
      { label: "すでに知っている内容だった", value: 6 },
      { label: "興味がある内容だった", value: 7 },
      { label: "興味が持てない内容だった", value: 8 },
      { label: "将来役立つ内容だった", value: 9 },
    ],
  },
  {
    type: "input",
    text: "授業の感想をご記入ください。",
  },
] as const;

export type FSForm = typeof FS_QUESTIONS;
export type FSQuestionSchema = { text: string } & (
  | {
      type: "select";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options: { label: string; value: any }[];
    }
  | {
      type: "input";
    }
);
export type FSQuestion = FSForm[number];

type Head<T extends readonly unknown[]> = T extends [] ? never : T[0];
type Tail<T extends readonly unknown[]> = T extends readonly [
  head: unknown,
  ...tail: infer Rest
]
  ? Rest
  : never;

export type FSAnswer<T> = T extends FSQuestion
  ? T extends {
      type: "select";
    }
    ? T["options"][number]["value"]
    : string | undefined
  : never;

type FSAnswersFrom<T extends readonly unknown[]> = Head<Tail<T>> extends never
  ? [FSAnswer<Head<T>>]
  : [FSAnswer<Head<T>>, ...FSAnswersFrom<Tail<T>>];

export type FSFormAnswers = FSAnswersFrom<FSForm>;

export async function fillFS(
  page: Page,
  index: number,
  [answer1, answer2, answer3, answer4, answer5]: FSFormAnswers
): Promise<Result<"success">> {
  await page.click(NAV_INFO);
  await waitForClickNavigation(page, NAV_FS_LINK);
  try {
    // log(`--- click row`);
    const rows = await page.$$("tr.ui-widget-content");
    const row = rows[index];
    const link = await row.$("a");
    if (!link) throw `no enqName found for fs ${index}`;
    await link.click();

    await page.waitForSelector(`.ui-radiobutton-box`);
    const buttons = await page.$$(".ui-radiobutton-box");

    const textareas = await page.$$("textarea");
    // q1
    await buttons[answer1].click();
    // q2
    if (answer2) {
      await textareas[0].type(answer2);
    }
    // q3
    await buttons[answer3].click();
    // q4
    await buttons[answer4].click();
    // q5
    if (answer5) {
      await textareas[1].type(answer5);
    }

    // log(`--- try confirm`);
    await page.click(`.btnAnswer`);
    await sleep(1000);
    const confirm1 = await page.$$(CONFIRM_BUTTON);
    await confirm1[1].click();
    await sleep(1000);
    const confirm2 = await page.$$(CONFIRM_BUTTON);
    await confirm2[2].click();
    await page.waitForSelector(".msgArea");
    // log(`✅ ok fill ${title}!`);
    return { data: "success" };
  } catch (e) {
    return { error: `failed to fill fs: ${e}` };
  }
}

export async function showAllFS(page: Page) {
  await page.click(
    "#funcForm\\:j_idt599\\:j_idt601\\:1\\:j_idt602\\:answeredFlg > span"
  );
  await page.click("#funcForm\\:j_idt599\\:j_idt601\\:1\\:j_idt602\\:search");
  await page.waitForSelector(".sign.signAlreadyAns.ans");
}
