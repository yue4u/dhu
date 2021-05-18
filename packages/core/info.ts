import { Page } from "playwright-chromium";
import {
  Attachment,
  sleep,
  waitForClickNavigation,
  handleDownloadTable,
  HandleAttachmentOptions,
} from "./utils";
import {
  NAV_INFO,
  NAV_INFO_LINK,
  INFO_GENERAL_ALL,
  INFO_GENERAL_ITEM,
  INFO_GENERAL_ITEM_STATE,
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

export type GetInfoOptions = {
  listAll?: boolean;
  skipRead?: boolean;
  content?: boolean;
  attachments?: HandleAttachmentOptions;
};

export type GetInfoItemOptions = GetInfoOptions & {
  navigate?: boolean;
};

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
  options.skipRead ??= true;

  await navigateToInfo(page);

  if (options.listAll) {
    await openAll(page);
  }

  const infoGeneralItemLinks = await page.$$(INFO_GENERAL_ITEM);
  const len = infoGeneralItemLinks.length;
  let count = 0;
  const infoList: Info[] = [];
  while (count !== len) {
    if (options.skipRead) {
      const states = await page.$$(INFO_GENERAL_ITEM_STATE);
      const state = await states[count].textContent();
      if (state?.trim() === "未読にする") {
        count += 1;
        continue;
      }
    }
    const info = await getInfoItemByIndex(page, count, {
      ...options,
      // skip open here
      listAll: false,
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

  if (options.listAll) {
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
        const innerTextOf = (e?: Element | null) =>
          (e as HTMLElement)?.innerText?.trim() ?? "";
        return els.map(innerTextOf);
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
      attachments = await handleDownloadTable(page, options.attachments);
    }
    ret = { ...ret, attachments };
  }

  await page.click(INFO_ITEM_CLOSE);
  await sleep(2000);
  return ret;
}
