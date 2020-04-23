import {
  chromium,
  BrowserTypeLaunchOptions,
  ChromiumBrowserContext,
} from "playwright";
import {
  LOGIN_ID,
  LOGIN_PASSWORD,
  LOGIN_SUBMIT_BUTTON,
  URL_TOP,
} from "./selectors";
import { getUserInfo, removeUserInfo } from "./userInfo";

export async function login(option?: BrowserTypeLaunchOptions) {
  const { id, password } = await getUserInfo();
  const browser = await chromium.launch(option);
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(URL_TOP);
  //await exposeGlobalHelper(ctx);

  // if(maintenance){
  //   // TODO
  // }

  await page.type(LOGIN_ID, id);
  await page.type(LOGIN_PASSWORD, password);
  await Promise.all([
    page.waitForNavigation(),
    page.click(LOGIN_SUBMIT_BUTTON),
  ]);
  const err = await page.evaluate(() => {
    const e = document.querySelector(".ui-messages-error-detail");
    const textContentOf = (e?: Element | null) => e?.textContent?.trim() ?? "";
    return e === null ? e : textContentOf(e);
  });

  if (err) {
    console.error(err);
    await removeUserInfo();
    process.exit();
  }
  return { page, browser };
}

export async function exposeGlobalHelper(ctx: ChromiumBrowserContext) {}
