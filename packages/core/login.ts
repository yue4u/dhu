import {
  chromium,
  LaunchOptions,
  BrowserContext,
  Page,
  Browser,
} from "playwright-chromium";
import {
  LOGIN_ID,
  LOGIN_PASSWORD,
  LOGIN_SUBMIT_BUTTON,
  URL_TOP,
} from "./selectors";
import { getUserInfo, removeUserInfo } from "./userInfo";
import { waitForClickNavigation, waitForNavigation } from "./utils";
export type LoginResult = {
  page: Page;
  browser: Browser;
};

export async function login(
  option?: LaunchOptions
): Promise<{
  error?: string;
  result?: LoginResult;
}> {
  const info = await getUserInfo();
  if (!info) {
    console.log("please provide login info, try `dhu login`");
    return { error: "please login" };
  }
  const { id, password } = info;
  const browser = await chromium.launch(option);
  // @ts-ignore
  const ctx = await browser.newContext({ acceptDownloads: true });
  const page = await ctx.newPage();
  await waitForNavigation(page, () => page.goto(URL_TOP));

  const maintenanceMessage = await page.evaluate(() => {
    const e = document.querySelector("#funcContent > div > p");
    const textContentOf = (e?: Element | null) => e?.textContent?.trim() ?? "";
    return e === null ? e : textContentOf(e);
  });

  if (maintenanceMessage) {
    return { error: maintenanceMessage };
  }

  await page.type(LOGIN_ID, id);
  await page.type(LOGIN_PASSWORD, password);
  await waitForClickNavigation(page, LOGIN_SUBMIT_BUTTON);
  const error = await page.evaluate(() => {
    const e = document.querySelector(".ui-messages-error-detail");
    const textContentOf = (e?: Element | null) => e?.textContent?.trim() ?? "";
    return e === null ? e : textContentOf(e);
  });

  if (error) {
    await removeUserInfo();
    return { error };
  }

  return { result: { page, browser } };
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export async function exposeGlobalHelper(ctx: BrowserContext) {}

export async function withLogin<T>(
  fn: (ctx: LoginResult) => Promise<T>,
  option?: LaunchOptions
) {
  const { error, result } = await login(option);
  if (error || !result) {
    throw error;
  }
  const ret = await fn(result);
  await result.browser.close();
  return ret;
}

export async function withLoginedPage<T>(
  fn: (page: Page) => Promise<T>,
  option?: LaunchOptions
) {
  return await withLogin(async ({ page }) => await fn(page), option);
}

export async function withLoginedBrowser<T>(
  fn: (browser: Browser) => T,
  option?: LaunchOptions
) {
  return await withLogin(async ({ browser }) => fn(browser), option);
}

export async function withBrowser<T>(
  fn: (browser: Browser) => Promise<T>,
  option?: LaunchOptions
) {
  const browser = await chromium.launch(option);
  const ret = await fn(browser);
  await browser.close();
  return ret;
}

export async function withPage<T>(
  fn: (page: Page) => Promise<T>,
  option?: LaunchOptions
) {
  return await withBrowser(async (browser) => {
    const ctx = await browser.newContext({ acceptDownloads: true });
    const page = await ctx.newPage();
    return fn(page);
  }, option);
}
