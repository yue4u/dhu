import { Page } from "playwright-chromium";
import { sleep } from "./utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ThirdPartyAny = any;

declare const PrimeFaces: ThirdPartyAny;
declare const syncTransition: ThirdPartyAny;
declare const confirmIfModified: ThirdPartyAny;

export const waitForNavigation = async <T>(
  page: Page,
  fn: () => Promise<T>
) => {
  return Promise.all([page.waitForNavigation(), fn()]);
};

const navigateActions = {
  top: () => {
    confirmIfModified("headerForm:logo");
  },

  fs: () => {
    syncTransition("menuForm:mainMenu");
    PrimeFaces.addSubmitParam("menuForm", {
      "menuForm:mainMenu": "menuForm:mainMenu",
      "menuForm:mainMenu_menuid": "4_3_0_0",
    }).submit("menuForm");
  },

  info: () => {
    syncTransition("menuForm:mainMenu");
    PrimeFaces.addSubmitParam("menuForm", {
      "menuForm:mainMenu": "menuForm:mainMenu",
      "menuForm:mainMenu_menuid": "4_0_0_0",
    }).submit("menuForm");
  },

  classProfile: () => {
    document
      .querySelector<HTMLElement>(
        "#funcForm\\:j_idt361\\:j_idt2241\\:j_idt2247"
      )
      ?.click();
  },
} as const;

const navigateMap = new Map(Object.entries(navigateActions));

export function navigate(page: Page) {
  return {
    async to(name: keyof typeof navigateActions) {
      const fn = navigateMap.get(name);
      if (!fn) return;
      await sleep(500);
      await waitForNavigation(page, async () => {
        await page.evaluate(fn);
      });
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async by(fn: () => Promise<any>) {
      return Promise.all([page.waitForNavigation(), fn()]);
    },

    async byClick(selector: string) {
      return Promise.all([page.waitForNavigation(), page.click(selector)]);
    },

    async byGoto(url: string) {
      return Promise.all([page.waitForNavigation(), page.goto(url)]);
    },
  };
}
