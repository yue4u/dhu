import { Page } from "playwright-chromium";
import {
  Attachment,
  sleep,
  handleDownloadTable,
  HandleAttachmentOptions,
} from "./utils";
import {
  INFO_GENERAL_ITEM,
  INFO_GENERAL_ITEM_STATE,
  INFO_ITEM_CLOSE,
  INFO_ALL,
} from "./selectors";
import { sync } from "./sync";
import { LoginContext } from "./login";
import { navigate } from "./navigate";

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
  attachmentOptions?: HandleAttachmentOptions;
  sync?: boolean;
};

export type GetInfoItemOptions = GetInfoOptions & {
  navigate?: boolean;
};

export async function openAll(page: Page) {
  await page.click(INFO_ALL);
  await sleep(3000);
}

export async function getInfo(
  { page }: LoginContext,
  options: GetInfoOptions
): Promise<Info[]> {
  options.skipRead ??= true;

  await navigate(page).to("info");

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
    try {
      const info = await getInfoItemByIndex(page, count, {
        ...options,
        // skip open here
        listAll: false,
        // skip navigation here
        navigate: false,
      });
      infoList.push(info);

      if (options.sync) {
        const ok = await sync.file.skipOrWrite({
          dir: ["info"],
          name: info.title,
          ext: ".md",
          content: () => infoToMarkdown(info),
        });
        if (!ok) {
          sync.log("info", "skip rest info due to exist file");
          break;
        }
      }
    } catch (e) {
      console.log(e);
    }
    count += 1;
  }

  return infoList.filter((i) => Boolean(i.title));
}

const keyNames = [
  ["title", "タイトル"],
  ["url", "リンク"],
  ["sender", "差出人"],
  ["category", "カテゴリ"],
  ["content", "本文"],
  ["availableTime", "掲示期間"],
] as const;

function infoToMarkdown(info: Info) {
  const main = keyNames.flatMap(([key, name]) => {
    const val = info[key] ?? "";
    return [`## ${name}`, val].filter(Boolean);
  });
  const attachments = (info.attachments || [])
    .map((a) => `- [${a.title}](./${a.filename})`)
    .join("\n");

  return [`# ${info.title}"`, ...main, "## Attachments", attachments].join(
    "\n\n"
  );
}

export async function getInfoItemByIndex(
  page: Page,
  count: number,
  options: GetInfoItemOptions
): Promise<Info> {
  if (options.navigate) {
    await navigate(page).to("info");
  }

  if (options.listAll) {
    await openAll(page);
  }

  const infoItemLinks = await page.$$(INFO_GENERAL_ITEM);
  const parent = infoItemLinks[count];

  const title = (await parent.textContent()) ?? "";
  let ret: Info = { title };
  if (!(options.content || options.attachmentOptions)) {
    return ret;
  }
  await page.evaluate(
    ([selector, i]) => {
      (
        document.querySelectorAll(selector as string)[
          i as number
        ] as HTMLElement
      ).click();
    },
    [INFO_GENERAL_ITEM, count]
  );
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

  if (options.attachmentOptions?.download) {
    const hasAttachments = await page.evaluate(
      () => document.querySelector(`#bsd00702\\:ch\\:j_idt502`) !== null
    );
    let attachments: Attachment[] = [];
    if (hasAttachments) {
      await page.click(`#bsd00702\\:ch\\:j_idt502`);
      attachments = await handleDownloadTable(page, options.attachmentOptions);
    }
    ret = { ...ret, attachments };
  }

  await page.click(INFO_ITEM_CLOSE);
  await sleep(2000);
  return ret;
}
