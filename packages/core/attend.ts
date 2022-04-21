import type { LaunchOptions } from "playwright-chromium";
import { withLogin } from "./login";
import {
  MOBILE_ATTEND_SUBMIT_BUTTON,
  MOBILE_ATTEND_CHECK_BUTTON,
} from "./selectors";
import { sleep } from "./utils";
import { navigate } from "./navigate";

export async function attend(code: string, options?: LaunchOptions) {
  if (code.length !== 4) {
    return {
      error: `expect code length to be 4, but \`${code}\`'s length is ${code.length}`,
    };
  }

  return withLogin(
    async ({ page }) => {
      const done = await page.isVisible(MOBILE_ATTEND_CHECK_BUTTON);
      if (done) {
        // already submitted
        await navigate(page).byClick(MOBILE_ATTEND_CHECK_BUTTON);
      } else {
        // FIXME wait for input or focus selector
        await sleep(2000);

        // TODO: check is code input view
        for (const c of code) {
          const handle = await page.evaluateHandle(
            () => document.activeElement
          );
          const el = handle.asElement();
          if (!el) throw new Error("no element found for input");

          // TODO: assert el is input type
          await el.type(c);
          await sleep(100);
        }
        await navigate(page).byClick(MOBILE_ATTEND_SUBMIT_BUTTON);
      }

      const result = await page.evaluate(() => {
        const e = document.querySelector(".attendSuc");
        const textContentOf = (e?: Element | null) =>
          e?.textContent?.trim() ?? "";
        return e === null ? e : textContentOf(e);
      });

      return result;
    },
    options,
    { target: "mobile" }
  );
}
