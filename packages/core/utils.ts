import path from "path";
import { Page } from "playwright-chromium";
import { Result } from "./login";
import { INFO_ITEM_ATTACHMENT_CLOSE } from "./selectors";

export const theWorld = () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  return new Promise(() => {});
};

export const sleep = (timeout: number) => {
  return new Promise((done) => setTimeout(done, timeout));
};

export const textContentOf = (e?: Element | null) =>
  e?.textContent?.trim() ?? "";

export const waitForNavigation = async <T>(
  page: Page,
  fn: () => Promise<T>
) => {
  return Promise.all([page.waitForNavigation(), fn()]);
};

export const waitForClickNavigation = async (page: Page, selector: string) => {
  return Promise.all([page.waitForNavigation(), page.click(selector)]);
};

interface Matcher<T, E> {
  ok: (data: T) => void | Promise<void>;
  error?: (error?: E) => void | Promise<void>;
}

export const match = async <T, E = string>(
  result: Result<T, E>,
  matcher?: Matcher<T, E>
) => {
  const { data, error } = result;
  const { ok: handleOK = console.log, error: handleError = console.error } =
    matcher ?? {};
  if (error || !data) {
    return handleError(error);
  }
  return handleOK(data);
};

export async function navigateToClassProfile(page: Page) {
  await sleep(500);
  await waitForNavigation(page, async () => {
    return page.evaluate(() => {
      document
        .querySelector<HTMLElement>(
          "#funcForm\\:j_idt361\\:j_idt2241\\:j_idt2247"
        )
        ?.click();
    });
  });
}

export async function openClassProfileSidebar(page: Page) {
  await page.evaluate(() => {
    Array.from(
      document.querySelectorAll<HTMLElement>(".ui-icon-plusthick")
    ).forEach((e) => e.click());
  });
  await sleep(500);
}

export async function collectFromClassProfile(
  page: Page,
  fn: (page: Page, title: string, index: number) => Promise<void>
) {
  const classes = await page.$$(".classList a");
  let i = 0;
  for (const _ of classes) {
    const handles = await page.$$(".classList a");
    const handle = handles[i];

    const title = await handle.textContent();
    await handle.click();
    await sleep(1000);
    await fn(page, title || "", i);
    i++;
  }
}

export interface Attachment {
  title: string;
  filename?: string;
  url?: string;
}

export type HandleAttachmentOptions =
  | {
      dir: string;
      download: true;
    }
  | { download?: false };

export async function handleDownloadTable(
  page: Page,
  options: HandleAttachmentOptions
) {
  const attachments: Attachment[] = [];
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
    if (!options.download) {
      attachments.push({ title });
      continue;
    }
    const attachmentDownloadButton = await row.$("button");
    if (!attachmentDownloadButton) continue;
    await attachmentDownloadButton.click();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      attachmentDownloadButton.click(),
    ]);
    const suggestedFilename = download.suggestedFilename();
    const downloadPath = path.join(options.dir, suggestedFilename);
    await download.saveAs(downloadPath);

    const failure = await download.failure();
    if (failure) {
      console.log(failure);
    }
    // all urls are same, doesn't really make sense to store them.
    url = download.url();
    attachments.push({ title, url, filename: suggestedFilename });
  }
  await page.click(INFO_ITEM_ATTACHMENT_CLOSE);

  return attachments;
}
