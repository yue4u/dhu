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
import { getUserInfo, LoginInfo, removeUserInfo } from "./userInfo";
import { waitForClickNavigation, waitForNavigation } from "./utils";

export type LoginContext = {
  page: Page;
  browser: Browser;
};

export type Result<T, E = string> = {
  error?: E;
  data?: T;
};

export type LoginOptions = {
  removeUserInfoOnError?: boolean;
};

export async function login(
  info: LoginInfo,
  launchOptions: LaunchOptions = {},
  loginOptions: LoginOptions = {}
): Promise<Result<LoginContext>> {
  const { id, password } = info;
  const browser = await chromium.launch(launchOptions);
  const ctx = await browser.newContext({ acceptDownloads: true });
  const page = await ctx.newPage();
  try {
    await waitForNavigation(page, () => page.goto(URL_TOP));

    const maintenanceMessage = await page.evaluate(() => {
      const e = document.querySelector("#funcContent > div > p");
      const textContentOf = (e?: Element | null) =>
        e?.textContent?.trim() ?? "";
      return e === null ? e : textContentOf(e);
    });

    if (maintenanceMessage) {
      throw new Error(maintenanceMessage);
    }

    await page.type(LOGIN_ID, id);
    await page.type(LOGIN_PASSWORD, password);
    await waitForClickNavigation(page, LOGIN_SUBMIT_BUTTON);

    const loginErrorMessage = await page.evaluate(() => {
      const e = document.querySelector(".ui-messages-error-detail");
      const textContentOf = (e?: Element | null) =>
        e?.textContent?.trim() ?? "";
      return e === null ? e : textContentOf(e);
    });

    if (loginErrorMessage) {
      if (loginOptions.removeUserInfoOnError) {
        await removeUserInfo();
      }
      throw new Error(loginErrorMessage);
    }
  } catch (error) {
    await browser.close();

    return { error };
  }

  return { data: { page, browser } };
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export async function exposeGlobalHelper(ctx: BrowserContext) {}

export async function withLogin<T>(
  fn: (ctx: LoginContext) => Promise<T>,
  option?: LaunchOptions
): Promise<Result<T>> {
  const info = await getUserInfo().catch(console.error);
  if (!info) {
    return { error: "please provide login info, try `dhu login`" };
  }
  const { error, data: loginContext } = await login(info, option, {
    removeUserInfoOnError: true,
  });
  if (error || !loginContext) {
    return { error };
  }
  try {
    const data = await fn(loginContext);
    await loginContext.browser.close();
    return { data };
  } catch (error) {
    return { error };
  }
}

export async function withBrowser<T>(
  fn: (browser: Browser) => Promise<T>,
  option?: LaunchOptions
): Promise<Result<T>> {
  const browser = await chromium.launch(option);
  try {
    const data = await fn(browser);
    await browser.close();
    return { data };
  } catch (error) {
    await browser.close();
    return { error };
  }
}

export async function withPage<T>(
  fn: (page: Page) => Promise<T>,
  option?: LaunchOptions
) {
  return withBrowser(async (browser) => {
    try {
      const ctx = await browser.newContext({ acceptDownloads: true });
      const page = await ctx.newPage();
      const data = await fn(page);
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }, option);
}
