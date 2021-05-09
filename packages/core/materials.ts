import { Page } from "playwright-chromium";
import { CLASS_PROFILE_MATERIALS } from "./selectors";
import { LoginContext } from "./login";
import {
  navigateToClassProfile,
  openClassProfileSidebar,
  collectFromClassProfile,
  waitForClickNavigation,
  waitForNavigation,
  handleDownloadTable,
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

export interface Attachment {
  title: string;
  url?: string;
}

export interface SyncMaterialsOptions {
  dir: string;
}

export type MaterialMap = Record<string, Material[]>;

export async function getMaterials(
  { page }: LoginContext,
  options?: SyncMaterialsOptions
): Promise<MaterialMap> {
  await navigateToClassProfile(page);
  await openClassProfileSidebar(page);
  await waitForClickNavigation(page, CLASS_PROFILE_MATERIALS);

  const materialsMap: Record<string, Material[]> = {};
  await collectFromClassProfile(page, async (page, title, index) => {
    const tasks = await collectClassMaterials(page, index);
    materialsMap[title] = tasks;
  });
  return materialsMap;
}

async function collectClassMaterials(page: Page, classIndex: number) {
  const materialsRows = await page.$$("#funcForm\\:jgdocList_data > tr");
  const materials: Material[] = [];
  let i = 0;
  for (const _ of materialsRows) {
    const rows = await page.$$("#funcForm\\:jgdocList_data > tr");
    let material = await rows[i].$$eval("td", (tds) => {
      const textContentOf = (e?: Element | null) =>
        e?.textContent?.trim() ?? "";

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
      ] = tds.map(textContentOf);

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
      const hasDetail = await rows[i].evaluate(
        (e) => e.querySelector("a") !== null
      );
      if (hasDetail) {
        await waitForNavigation(page, async () => {
          await rows[i].evaluate((e) => {
            e.querySelector("a")?.click();
          });
        });

        console.log(`on details ${material.name}`);
        const details = await collectClassMaterialsDetails(page, classIndex);
        material = { ...material, ...details };
      }
      console.log({ material, hasDetail });
      materials.push(material);
    }
    i++;
  }
  return materials;
}

async function collectClassMaterialsDetails(
  page: Page,
  classIndex: number
): Promise<Pick<Material, "content" | "attachments">> {
  const content = await page.$eval(".contentsArea", (e) => {
    const textContentOf = (e?: Element | null) => e?.textContent?.trim() ?? "";
    return textContentOf(e);
  });

  const hasAttachments = await page.evaluate(
    () => document.querySelector("#funcForm\\:j_idt368") !== null
  );
  const attachments: Attachment[] = [];

  if (hasAttachments) {
    await page.click("#funcForm\\:j_idt368");
    attachments.push(
      ...(await handleDownloadTable(page, { downloadsPath: process.cwd() }))
    );
  }

  // go back
  const handles = await page.$$(".classList a");
  await waitForNavigation(page, async () => {
    await handles[classIndex].click();
  });

  return { content };
}
