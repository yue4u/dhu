import { URL, LOGIN } from "./selectors";
import { chromium } from "playwright";

type LoginOptions = {
  id: string;
  password: string;
};
export async function login({ id, password }: LoginOptions) {
  const browser = await chromium.launch({ headless: false });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(URL.TOP);

  await page.type(LOGIN.ID, id);
  await page.type(LOGIN.PASSWORD, password);
  await page.click(LOGIN.SUBMIT_BUTTON);
}
