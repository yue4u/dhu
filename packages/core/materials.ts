import { Page } from "playwright-chromium";
import fs from "fs-extra";
import path from "path";
import { CLASS_PROFILE_MATERIALS } from "./selectors";
import { LoginContext } from "./login";
import {
  navigateToClassProfile,
  openClassProfileSidebar,
  collectFromClassProfile,
  waitForClickNavigation,
  waitForNavigation,
  Attachment,
  handleDownloadTable,
  HandleAttachmentOptions,
} from "./utils";

export interface Material {
  title?: string;
  group?: string; // 授業資料グループ
  name?: string; // 授業資料名
  course?: string; // コース
  tableOfContents?: string; // 目次
  when?: string; // 未確認
  lectureTime?: string; // 授業実施日
  publicTime?: string; // 資料公開開始日
  finishTime?: string; // 資料公開終了日
  sender?: string; // 作成者
  // details
  content?: string;
  attachments?: Attachment[];
}

export interface SyncMaterialsOptions {
  dir: string;
}

export type MaterialMap = Record<string, Material[]>;

export async function getMaterials(
  { page }: LoginContext,
  options: SyncMaterialsOptions
): Promise<MaterialMap> {
  await navigateToClassProfile(page);
  await openClassProfileSidebar(page);
  await waitForClickNavigation(page, CLASS_PROFILE_MATERIALS);

  const materialsMap: Record<string, Material[]> = {};
  await collectFromClassProfile(page, async (page, title, index) => {
    const classDir = path.join(options.dir, title);
    await fs.ensureDir(classDir);
    const tasks = await collectClassMaterials(page, index, classDir);
    materialsMap[title] = tasks;
  });
  return materialsMap;
}

async function collectClassMaterials(
  page: Page,
  classIndex: number,
  classDir: string
) {
  const materialsRows = await page.$$("#funcForm\\:jgdocList_data > tr");
  const materials: Material[] = [];
  let i = 0;
  for (const _ of materialsRows) {
    const rows = await page.$$("#funcForm\\:jgdocList_data > tr");
    let material = await rows[i].$$eval("td", (tds) => {
      const innerTextOf = (e?: Element | null) =>
        (e as HTMLElement)?.innerText?.trim() ?? "";

      const [
        group,
        name,
        course,
        tableOfContents,
        when,
        lectureTime,
        publicTime,
        finishTime,
        sender,
      ] = tds.map(innerTextOf);

      return {
        group,
        name,
        course,
        tableOfContents,
        when,
        lectureTime,
        publicTime,
        finishTime,
        sender,
      };
    });
    if (material.name) {
      material.name = material.name.replaceAll("/", "-");
      const mdPath = path.join(classDir, `${material.name}.md`);
      const exist = await fs.pathExists(mdPath);
      if (exist) {
        console.log(`skip: ${mdPath}`);
      } else {
        const hasDetail = await rows[i].evaluate(
          (e) => e.querySelector("a") !== null
        );
        if (hasDetail) {
          console.log(`syncing: ${material.name}`);
          await waitForNavigation(page, async () => {
            await rows[i].evaluate((e) => {
              e.querySelector("a")?.click();
            });
          });

          const details = await collectClassMaterialsDetails(page, classIndex, {
            download: true,
            dir: classDir,
          });
          material = { ...material, ...details };
        }
        await fs.writeFile(mdPath, materialToMarkdown(material), {
          encoding: "utf-8",
        });
      }
      materials.push(material);
    }
    i++;
  }
  return materials;
}

async function collectClassMaterialsDetails(
  page: Page,
  classIndex: number,
  options: HandleAttachmentOptions
): Promise<Pick<Material, "content" | "attachments">> {
  const content = await page.$eval(".contentsArea", (e) => {
    const innerTextOf = (e?: Element | null) =>
      (e as HTMLElement)?.innerText?.trim() ?? "";
    return innerTextOf(e);
  });

  const hasAttachments = await page.evaluate(
    () => document.querySelector("#funcForm\\:j_idt368") !== null
  );
  let attachments: Attachment[] = [];

  if (hasAttachments) {
    await page.click("#funcForm\\:j_idt368");
    attachments = await handleDownloadTable(page, options);
  }

  // go back
  const handles = await page.$$(".classList a");
  await waitForNavigation(page, async () => {
    await handles[classIndex].click();
  });

  return { content, attachments };
}

const keyNames = [
  ["group", "授業資料グループ"],
  ["name", "授業資料名"],
  ["course", "コース"],
  ["tableOfContents", "目次"],
  ["when", "未確認"],
  ["lectureTime", "授業実施日"],
  ["publicTime", "資料公開開始日"],
  ["finishTime", "資料公開終了日"],
  ["sender", "作成者"],
  ["content", "内容"],
] as const;

function materialToMarkdown(material: Material) {
  const main = keyNames.flatMap(([key, name]) => {
    const val = material[key] ?? "";
    return [`## ${name}`, val].filter(Boolean);
  });
  const attachments = (material.attachments || [])
    .map((a) => `- [${a.title}](./${a.filename})`)
    .join("\n");

  return [`# ${material.name}"`, ...main, "## Attachments", attachments].join(
    "\n\n"
  );
}
