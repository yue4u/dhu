import type { LaunchOptions } from "playwright-chromium";
import { withLogin } from "./login";
import { MOBILE_ATTEND_SUBMIT_BUTTON } from "./selectors";
import { sleep } from "./utils";

export async function attend(code: string, options?: LaunchOptions) {
  if (code.length !== 4) {
    return {
      error: `expect code length to be 4, but \`${code}\`'s length is ${code.length}`,
    };
  }

  return withLogin(
    async ({ page }) => {
      // FIXME wait for input or focus selector
      await sleep(2000);

      // TODO: check is code input view

      for (const c of code) {
        const handle = await page.evaluateHandle(() => document.activeElement);
        const el = handle.asElement();
        if (!el) throw new Error("no element found for input");

        // TODO: asset el is input type
        await el.type(c);
        await sleep(100);
      }
      await page.click(MOBILE_ATTEND_SUBMIT_BUTTON);
    },
    options,
    { target: "mobile" }
  );
}
