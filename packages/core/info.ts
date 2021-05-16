import { Page } from "playwright-chromium";
import {
  sleep,
  waitForClickNavigation,
  handleDownloadTable,
  Attachment,
  HandleAttachmentOptions,
} from "./utils";
import {
  NAV_INFO,
  NAV_INFO_LINK,
  INFO_GENERAL_ALL,
  INFO_GENERAL_ITEM,
  INFO_CLASS_ALL,
  INFO_ITEM_CLOSE,
  INFO_ALL,
} from "./selectors";
import { LoginContext } from "./login";

export interface InfoContent {
  sender?: string;
  category?: string;
  content?: string;
  available?: string;
  title?: string;
  attachments?: Attachment[];
}

export interface Info extends InfoContent {
  title?: string;
  url?: string;
  attachments?: Attachment[];
}

export interface GetInfoOptions {
  all?: boolean;
  content?: boolean;
  attachments?: boolean;
  dir: string;
}

export async function getInfo(
  { page }: LoginContext,
  options: GetInfoOptions
): Promise<Info[]> {
  await page.click(NAV_INFO);
  await waitForClickNavigation(page, NAV_INFO_LINK);

  await page.$eval(INFO_GENERAL_ALL, (e) => (e as HTMLElement).click());
  await page.waitForSelector(INFO_GENERAL_ITEM);

  if (options.all) {
    await page.click(INFO_ALL);
    await sleep(3000);

    // const lenText = await page.$eval(
    //   "#funcForm\\:tabArea\\:1\\:j_idt215 .keijiKensu",
    //   (e) => {
    //     const textContentOf = (e?: Element | null) =>
    //       e?.textContent?.trim() ?? "";
    //     return textContentOf(e);
    //   }
    // );
    // console.log(lenText);
  }

  const infoGeneralItemLinks = await page.$$(INFO_GENERAL_ITEM);
  const len = infoGeneralItemLinks.length;
  let count = 0;
  const infoList: Info[] = [];

  while (count !== len) {
    const info = await getInfoItem(page, count, options);
    infoList.push(info);
    count += 1;
  }

  await page.$eval(INFO_CLASS_ALL, (e) => (e as HTMLElement).click());

  return infoList.filter((i) => Boolean(i.title));
}

export async function getInfoItem(
  page: Page,
  count: number,
  options: GetInfoOptions
): Promise<Info> {
  const infoItemLinks = await page.$$(INFO_GENERAL_ITEM);
  const infoItem = infoItemLinks[count];
  const title = (await infoItem?.textContent()) ?? "";
  if (!(options.content || options.attachments)) {
    return { title };
  }
  const details = await getInfoItemDetail(page, count, options);
  return { title, ...details };
}

type GetInfoItemDetailOptions = HandleAttachmentOptions &
  Omit<GetInfoOptions, "all">;

async function getInfoItemDetail(
  page: Page,
  count: number,
  options: GetInfoItemDetailOptions
): Promise<InfoContent> {
  let ret = {};
  if (!(options.content || options.attachments)) {
    return ret;
  }
  await sleep(2000);
  const infoItemLinks = await page.$$(INFO_GENERAL_ITEM);
  const parent = infoItemLinks[count];
  await parent.click();
  await page.waitForSelector(INFO_ITEM_CLOSE);
  if (options.content) {
    const [sender, category, title, body, availableTime] = await page.$$eval(
      "tr > .ui-panelgrid-cell:nth-child(2)",
      (els) => {
        const textContentOf = (e?: Element | null) =>
          e?.textContent?.trim() ?? "";
        return els.map(textContentOf);
      }
    );
    const content = {
      sender,
      category,
      title,
      body,
      availableTime,
    };
    ret = { ...ret, content };
  }
  if (options.attachments) {
    const hasAttachments = await page.evaluate(
      () => document.querySelector(`#bsd00702\\:ch\\:j_idt502`) !== null
    );
    let attachments: Attachment[] = [];
    if (hasAttachments) {
      await page.click(`#bsd00702\\:ch\\:j_idt502`);
      attachments = await handleDownloadTable(page, options);
    }
    ret = { ...ret, attachments };
  }
  await page.click(INFO_ITEM_CLOSE);
  return ret;
}
