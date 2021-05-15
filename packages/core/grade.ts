import { LoginContext } from "./login";
import { NAV_GRADE, NAV_GRADE_LINK, GRADE_GPA } from "./selectors";
import { waitForClickNavigation } from "./utils";

export type GPA = {
  semester: string;
  gpa: string;
};

export async function getGPA({ page }: LoginContext): Promise<GPA[]> {
  await page.click(NAV_GRADE);
  await waitForClickNavigation(page, NAV_GRADE_LINK);
  const GPATable = await page.$eval(GRADE_GPA, (table) => {
    const textContentOf = (e?: Element | null) => e?.textContent?.trim() ?? "";
    return Array.from(table.querySelectorAll("tr")).map((row) => {
      const [semester, gpa] = Array.from(row.querySelectorAll("td")).map(
        textContentOf
      );
      return { semester, gpa };
    });
  });

  return GPATable;
}
