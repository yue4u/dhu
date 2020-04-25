import {
  chromium,
  BrowserTypeLaunchOptions,
  BrowserContext,
  Page,
  Browser,
} from "playwright";
import {
  LOGIN_ID,
  LOGIN_PASSWORD,
  LOGIN_SUBMIT_BUTTON,
  URL_TOP,
} from "./selectors";
import { getUserInfo, removeUserInfo } from "./userInfo";

export type LoginResult = {
  page: Page;
  browser: Browser;
};

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

export async function exposeGlobalHelper(ctx: BrowserContext) {}

export async function withLogin<T>(
  fn: (ctx: LoginResult) => Promise<T>,
  option?: BrowserTypeLaunchOptions
) {
  const loginCtx = await login(option);
  const result = await fn(loginCtx);
  await loginCtx.browser.close();
  return result;
}

export async function withPage<T>(
  fn: (page: Page) => T,
  option?: BrowserTypeLaunchOptions
) {
  return await withLogin(async ({ page }) => fn(page), option);
}

export async function withBrowser<T>(
  fn: (browser: Browser) => T,
  option?: BrowserTypeLaunchOptions
) {
  return await withLogin(async ({ browser }) => fn(browser), option);
}
