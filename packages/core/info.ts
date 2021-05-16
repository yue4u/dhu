import { Page } from "playwright-chromium";
import {
  sleep,
  waitForClickNavigation,
  handleDownloadTable,
  Attachment,
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

export interface Info {
  title?: string;
  url?: string;

  sender?: string;
  category?: string;
  content?: string;
  availableTime?: string;
  attachments?: Attachment[];
}

export interface GetInfoOptions {
  all?: boolean;
  content?: boolean;
  attachments?: boolean;
  dir: string;
}

export interface GetInfoItemOptions extends GetInfoOptions {
  navigate?: boolean;
}

export async function navigateToInfo(page: Page) {
  await page.click(NAV_INFO);
  await waitForClickNavigation(page, NAV_INFO_LINK);

  await page.$eval(INFO_GENERAL_ALL, (e) => (e as HTMLElement).click());
  await page.waitForSelector(INFO_GENERAL_ITEM);
}

export async function openAll(page: Page) {
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

export async function getInfo(
  { page }: LoginContext,
  options: GetInfoOptions
): Promise<Info[]> {
  await navigateToInfo(page);

  if (options.all) {
    await openAll(page);
  }

  const infoGeneralItemLinks = await page.$$(INFO_GENERAL_ITEM);
  const len = infoGeneralItemLinks.length;
  let count = 0;
  const infoList: Info[] = [];

  while (count !== len) {
    const info = await getInfoItemByIndex(page, count, {
      ...options,
      // skip open here
      all: false,
      // skip navigation here
      navigate: false,
    });
    infoList.push(info);
    count += 1;
  }

  await page.$eval(INFO_CLASS_ALL, (e) => (e as HTMLElement).click());

  return infoList.filter((i) => Boolean(i.title));
}

export async function getInfoItemByIndex(
  page: Page,
  count: number,
  options: GetInfoItemOptions
): Promise<Info> {
  if (options.navigate) {
    await navigateToInfo(page);
  }

  if (options.all) {
    await openAll(page);
  }

  const infoItemLinks = await page.$$(INFO_GENERAL_ITEM);
  const parent = infoItemLinks[count];

  const title = (await parent.textContent()) ?? "";
  let ret: Info = { title };
  if (!(options.content || options.attachments)) {
    return ret;
  }

  await parent.click();
  await page.waitForSelector(INFO_ITEM_CLOSE);

  if (options.content) {
    const [sender, category, title, content, availableTime] = await page.$$eval(
      "tr > .ui-panelgrid-cell:nth-child(2)",
      (els) => {
        const textContentOf = (e?: Element | null) =>
          e?.textContent?.trim() ?? "";
        return els.map(textContentOf);
      }
    );
    ret = { ...ret, sender, category, title, content, availableTime };
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
  await sleep(2000);
  return ret;
}
