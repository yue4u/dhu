import { Page } from "playwright-chromium";
import { Result } from "./login";

export const theWorld = () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  return new Promise(() => {});
};

export const sleep = (timeout: number) => {
  return new Promise((done) => setTimeout(done, timeout));
};

export const textContentOf = (e?: Element | null) =>
  e?.textContent?.trim() ?? "";

export const waitForNavigation = async <T>(
  page: Page,
  fn: () => Promise<T>
) => {
  return Promise.all([page.waitForNavigation(), fn()]);
};

export const waitForClickNavigation = async (page: Page, selector: string) => {
  return Promise.all([page.waitForNavigation(), page.click(selector)]);
};

interface Matcher<T, E> {
  ok: (data: T) => void | Promise<void>;
  error?: (error?: E) => void | Promise<void>;
}

export const match = async <T, E = string>(
  result: Result<T, E>,
  matcher?: Matcher<T, E>
) => {
  const { data, error } = result;
  const { ok: handleOK = console.log, error: handleError = console.error } =
    matcher ?? {};
  if (error || !data) {
    return handleError(error);
  }
  return handleOK(data);
};
