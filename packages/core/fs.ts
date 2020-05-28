import { Page } from "playwright-chromium";
import { NAV_INFO, NAV_FS_LINK } from "./selectors";
import { waitForClickNavigation } from "./utils";

export type FS = {
  title: string;
  status: string;
  deadline: string;
};

export async function getFS(page: Page): Promise<FS[]> {
  await page.click(NAV_INFO);
  await waitForClickNavigation(page, NAV_FS_LINK);
  const FSList = await page.$$eval("tr.ui-widget-content", (rows) => {
    const textContentOf = (e?: Element | null) => e?.textContent?.trim() ?? "";

    return rows.map((row) => {
      const [_, title, status, deadline] = Array.from(
        row.querySelectorAll("td")
      ).map(textContentOf);
      return { title, status, deadline };
    });
  });
  return FSList;
}
