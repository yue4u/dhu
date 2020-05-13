import { Page, ElementHandle } from "playwright-chromium";
import { sleep, waitForClickNavigation } from "./utils";
import {
  NAV_INFO,
  NAV_INFO_LINK,
  INFO_GENERAL_ALL,
  INFO_GENERAL_ITEM,
  INFO_CLASS_ALL,
  INFO_CLASS_ITEM,
  INFO_ITEM_ATTACHMENT_OPEN,
  INFO_ITEM_CLOSE,
  INFO_ITEM_ATTACHMENT_CLOSE,
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
  attachments: Attachment[];
};

export type Attachment = {
  title: string;
  url?: string;
};

export async function getInfo(page: Page): Promise<Info[]> {
  await page.click(NAV_INFO);
  await waitForClickNavigation(page, NAV_INFO_LINK);

  await page.$eval(INFO_GENERAL_ALL, (e) => (e as HTMLElement).click());
  await sleep(2000);

  const infoGeneralItemLinks = await page.$$(INFO_GENERAL_ITEM);
  let len = infoGeneralItemLinks.length;
  let count = 0;
  let infoList: Info[] = [];

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

  return infoList;
}

export async function handleInfoItemLink(
  page: Page,
  selector: string,
  count: number
): Promise<Info> {
  await sleep(2000);

  const infoItemLinks = await page.$$(selector);
  const link = infoItemLinks[count];
  await link.click();
  await sleep(1000);
  const maybeAttachmentButton = await page.evaluate(() =>
    document.querySelector(`#bsd00702\\:ch\\:j_idt503`)
  );
  let attachments: Attachment[] = [];
  if (maybeAttachmentButton) {
    await page.click(`#bsd00702\\:ch\\:j_idt503`);

    await sleep(1000);

    const attachmentRows = await page.$$(".tableDownloadRow");

    for (const row of attachmentRows) {
      const title = await row.$eval("div", (e) => {
        const textContentOf = (e?: Element | null) =>
          e?.textContent?.trim() ?? "";
        return textContentOf(e);
      });
      let url: string | null = null;

      //if (attachmentTitle in seen){
      // skip
      //}
      const attachmentDownloadButton = await row.$("button");
      await attachmentDownloadButton?.click();
      if (attachmentDownloadButton) {
        const [download] = await Promise.all([
          page.waitForEvent("download"), // wait for download to start
          attachmentDownloadButton.click(),
        ]);

        const failure = await download.failure();
        if (failure) {
          console.log(failure);
        }
        const path = await download.path();
        if (path) {
          console.log({ path });
        }

        url = await download.url();
      }
      console.log({ title, url });
      console.log("await attachment close");
      attachments.push({ title, url });
    }
    await page.click(INFO_ITEM_ATTACHMENT_CLOSE);
  }
  await sleep(2000);
  console.log("await close");
  await page.click(INFO_ITEM_CLOSE);
  return { attachments };
}
