import { Page } from "playwright-chromium";
import fs from "fs-extra";
import { CLASS_PROFILE_MATERIALS } from "./selectors";
import { LoginContext } from "./login";
import {
  openClassProfileSidebar,
  collectFromClassProfile,
  Attachment,
  handleDownloadTable,
  HandleAttachmentOptions,
} from "./utils";
import { navigate } from "./navigate";
import { sync } from "./sync";

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

export type MaterialMap = Record<string, Material[]>;

export async function getMaterials(
  { page }: LoginContext,
  options: HandleAttachmentOptions
): Promise<MaterialMap> {
  await navigate(page).to("classProfile");
  await openClassProfileSidebar(page);
  await navigate(page).byClick(CLASS_PROFILE_MATERIALS);

  const materialsMap: Record<string, Material[]> = {};
  await collectFromClassProfile(page, async (page, title, index) => {
    if (!options.download) return;
    const tasks = await collectClassMaterials(page, title, index);
    materialsMap[title] = tasks;
  });
  return materialsMap;
}

async function collectClassMaterials(
  page: Page,
  className: string,
  classIndex: number
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
      await sync.file.skipOrWrite({
        dir: ["class", className],
        name: material.name,
        ext: ".md",
        async content() {
          const hasDetail = await rows[i].evaluate(
            (e) => e.querySelector("a") !== null
          );
          if (hasDetail) {
            sync.log("material", material.name);
            await navigate(page).by(async () => {
              await rows[i].evaluate((e) => {
                e.querySelector("a")?.click();
              });
            });

            const details = await collectClassMaterialsDetails(
              page,
              classIndex,
              {
                download: true,
                dir: sync.class.getPath(className),
              }
            );
            material = { ...material, ...details };
          }
          return materialToMarkdown(material);
        },
      });
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
  await navigate(page).by(async () => {
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
