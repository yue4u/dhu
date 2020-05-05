import { Page } from "playwright-chromium";

export const sleep = (timeout: number) => {
  return new Promise((done) => setTimeout(done, timeout));
};

export const textContentOf = (e?: Element | null) =>
  e?.textContent?.trim() ?? "";

export const waitForNavigation = async <T>(
  page: Page,
  fn: () => Promise<T>
) => {
  return await Promise.all([page.waitForNavigation(), fn()]);
};
