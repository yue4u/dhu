import { Page } from "playwright-chromium";
import path from "path";
import { sleep, waitForClickNavigation } from "./utils";
import {
  NAV_INFO,
  NAV_INFO_LINK,
  INFO_GENERAL_ALL,
  INFO_GENERAL_ITEM,
  INFO_CLASS_ALL,
  // INFO_CLASS_ITEM,
  // INFO_ITEM_ATTACHMENT_OPEN,
  INFO_ITEM_CLOSE,
  INFO_ITEM_ATTACHMENT_CLOSE,
  INFO_ALL,
} from "./selectors";
import { LoginContext } from "./login";

export type Info = {
  sender?: string;
  category?: string;
  content?: string;
  available?: string;
  title?: string;
  type?: string;
  url?: string;
  attachments?: Attachment[];
};

export type Attachment = {
  title: string;
  url?: string;
};

export type GetInfoOptions = {
  all?: boolean;
  attachments?: boolean;
  downloadsPath: string;
};

export async function getInfo(
  { page }: LoginContext,
  options: GetInfoOptions
): Promise<Info[]> {
  await page.click(NAV_INFO);
  await waitForClickNavigation(page, NAV_INFO_LINK);

  await page.$eval(INFO_GENERAL_ALL, (e) => (e as HTMLElement).click());
  await page.waitForSelector(INFO_GENERAL_ITEM);

  if (options.all) {
    console.log("all...");
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
    const info = await handleInfoItemLink(page, count, options);
    infoList.push(info);
    count += 1;
  }

  await page.$eval(INFO_CLASS_ALL, (e) => (e as HTMLElement).click());

  return infoList.filter((i) => Boolean(i.title));
}

export async function handleInfoItemLink(
  page: Page,
  count: number,
  options: GetInfoOptions
): Promise<Info> {
  const infoItemLinks = await page.$$(INFO_GENERAL_ITEM);
  const infoItem = infoItemLinks[count];
  const title = (await infoItem?.textContent()) ?? "";
  if (options.attachments) {
    const { attachments } = await handleAttachment(page, count, options);
    return { title, attachments };
  }
  return { title };
}

interface HandleAttachmentOptions {
  downloadsPath: string;
}

async function handleAttachment(
  page: Page,
  count: number,
  options: HandleAttachmentOptions
) {
  await sleep(3000);
  await page.waitForLoadState();
  const infoItemLinks = await page.$$(INFO_GENERAL_ITEM);
  const parent = infoItemLinks[count];
  await parent.click();
  await page.waitForSelector(INFO_ITEM_CLOSE);
  await sleep(3000);
  const attachmentExist = await page.evaluate(
    () => document.querySelector(`#bsd00702\\:ch\\:j_idt502`) !== null
  );
  const attachments: Attachment[] = [];
  if (attachmentExist) {
    await page.click(`#bsd00702\\:ch\\:j_idt502`);
    await page.waitForSelector(".tableDownloadRow");

    const attachmentRows = await page.$$(".tableDownloadRow");

    for (const row of attachmentRows) {
      const title = await row.$eval("div", (e) => {
        const textContentOf = (e?: Element | null) =>
          e?.textContent?.trim() ?? "";
        return textContentOf(e);
      });
      let url: string | null = null;

      // if (attachmentTitle in seen) {
      // TODO
      // }
      const attachmentDownloadButton = await row.$("button");
      if (!attachmentDownloadButton) continue;
      await attachmentDownloadButton.click();

      const [download] = await Promise.all([
        page.waitForEvent("download"),
        attachmentDownloadButton.click(),
      ]);
      const downloadPath = path.join(
        options.downloadsPath,
        download.suggestedFilename()
      );
      await download.saveAs(downloadPath);

      const failure = await download.failure();
      if (failure) {
        console.log(failure);
      }
      // all urls are same, doesn't really make sense to store them.
      url = download.url();
      attachments.push({ title, url });
    }
    await page.click(INFO_ITEM_ATTACHMENT_CLOSE);
  }
  await page.click(INFO_ITEM_CLOSE);
  return { attachments };
}
