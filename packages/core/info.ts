import { Page /* ElementHandle */ } from "playwright-chromium";
import { sleep, waitForClickNavigation } from "./utils";
import {
  NAV_INFO,
  NAV_INFO_LINK,
  INFO_GENERAL_ALL,
  INFO_GENERAL_ITEM,
  INFO_CLASS_ALL,
  // INFO_CLASS_ITEM,
  // INFO_ITEM_ATTACHMENT_OPEN,
  // INFO_ITEM_CLOSE,
  // INFO_ITEM_ATTACHMENT_CLOSE,
} from "./selectors";

export type Info = {
  sender?: string;
  category?: string;
  content?: string;
  available?: string;
  title?: string;
  type?: string;
  //type: "general" | "class" | "all"
  url?: string;
  attachments?: Attachment[];
};

export type Attachment = {
  title: string;
  url?: string;
};

export async function getInfo(page: Page): Promise<Info[]> {
  await page.click(NAV_INFO);
  await waitForClickNavigation(page, NAV_INFO_LINK);

  await page.$eval(INFO_GENERAL_ALL, (e) => (e as HTMLElement).click());
  await sleep(5000);
  await page.waitForSelector(INFO_GENERAL_ITEM);
  const infoGeneralItemLinks = await page.$$(INFO_GENERAL_ITEM);
  let len = infoGeneralItemLinks.length;
  let count = 0;
  const infoList: Info[] = [];

  while (count !== len) {
    const info = await handleInfoItemLink(page, INFO_GENERAL_ITEM, count);
    infoList.push(info);
    count += 1;
  }

  await page.$eval(INFO_CLASS_ALL, (e) => (e as HTMLElement).click());

  const infoClassItemLinks = await page.$$(INFO_GENERAL_ITEM);
  len += infoClassItemLinks.length;

  while (count !== len) {
    const info = await handleInfoItemLink(page, INFO_GENERAL_ITEM, count);
    infoList.push(info);
    count += 1;
  }

  //
  //const infoClassItemLinks = await page.$$(INFO_CLASS_ITEM);
  //
  //for (const link of infoClassItemLinks) {
  //  const info = await handleInfoItemLink(page, link);
  //  infoList.push(info);
  //}

  return infoList.filter((i) => Boolean(i.title));
}

export async function handleInfoItemLink(
  page: Page,
  selector: string,
  count: number
): Promise<Info> {
  // await sleep(2000);
  // console.log(`$$(${selector})`);
  const infoItemLinks = await page.$$(selector);
  const infoItem = infoItemLinks[count];
  const linkData = { title: (await infoItem?.textContent()) ?? "" };
  //console.log(linkData.title);
  return linkData;
  // const link = infoItemLinks[count];
  // console.log(`await link.click();`);
  // await link.click();
  // console.log(`await maybeAttachmentButton;`);
  // await sleep(5000);
  // const maybeAttachmentButton = await page.evaluate(() =>
  //   document.querySelector(`#bsd00702\\:ch\\:j_idt503`)
  // );
  // let attachments: Attachment[] = [];
  // if (maybeAttachmentButton) {
  //   console.log(`await page.click(#bsd00702\\:ch\\:j_idt503)`);
  //   await page.click(`#bsd00702\\:ch\\:j_idt503`);
  //   console.log(`await page.waitForSelector(".tableDownloadRow");`);

  //   await page.waitForSelector(".tableDownloadRow");

  //   const attachmentRows = await page.$$(".tableDownloadRow");

  //   for (const row of attachmentRows) {
  //     const title = await row.$eval("div", (e) => {
  //       const textContentOf = (e?: Element | null) =>
  //         e?.textContent?.trim() ?? "";
  //       return textContentOf(e);
  //     });
  //     let url: string | null = null;

  //     //if (attachmentTitle in seen){
  //     // skip
  //     //}
  //     const attachmentDownloadButton = await row.$("button");
  //     await attachmentDownloadButton?.click();
  //     if (attachmentDownloadButton) {
  //       const [download] = await Promise.all([
  //         page.waitForEvent("download"), // wait for download to start
  //         attachmentDownloadButton.click(),
  //       ]);

  //       const failure = await download.failure();
  //       if (failure) {
  //         console.log(failure);
  //       }
  //       const path = await download.path();
  //       if (path) {
  //         console.log({ path });
  //       }

  //       url = download.url();
  //     }
  //     console.log({ title, url });
  //     console.log("await attachment close");
  //     // sattachments.push({ title, url });
  //   }
  //   await page.click(INFO_ITEM_ATTACHMENT_CLOSE);
  // }
  // await sleep(2000);
  // console.log("await close");
  // await page.click(INFO_ITEM_CLOSE);
  // return { attachments };
}
