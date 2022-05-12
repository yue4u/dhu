import type { LaunchOptions, Page } from "playwright-chromium";
import { withLogin } from "./login";
import {
  MOBILE_ATTEND_SUBMIT_BUTTON,
  MOBILE_ATTEND_CHECK_BUTTON,
  MOBILE_ATTEND_CHECKING_LABEL,
} from "./selectors";
import { sleep } from "./utils";
import { navigate } from "./navigate";

export type AttendOptions = {
  code?: string;
  onMessage?: (msg: string) => void;
};

export async function attend(
  attendOptions: AttendOptions,
  launchOptions?: LaunchOptions
) {
  return withLogin(
    async ({ page }) => {
      const submitted = await page.isVisible(MOBILE_ATTEND_CHECK_BUTTON);
      attendOptions.onMessage?.(`submitted: ${submitted}`);
      submitted
        ? await navigate(page).byClick(MOBILE_ATTEND_CHECK_BUTTON)
        : await submitAttendCode(page, attendOptions);

      return getAttendResult(page);
    },
    launchOptions,
    { target: "mobile" }
  );
}

async function submitAttendCode(
  page: Page,
  { code, onMessage }: AttendOptions
) {
  if (!code) throw new Error("no code is provided");
  if (code.length !== 4) {
    throw new Error(
      `expect code length to be 4, but \`${code}\`'s length is ${code.length}`
    );
  }

  const isChecking = await page.$(MOBILE_ATTEND_CHECKING_LABEL);
  if (!isChecking) throw new Error("attend not checking");

  const isCheckingText = await isChecking?.textContent();
  if (isCheckingText) onMessage?.(isCheckingText);

  // TODO: find better way to check current focus is correct
  let retry = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const focusId = await page.evaluate(() => document.activeElement?.id);
    console.log(focusId);
    if (focusId === `pmPage:funcForm:j_idt90:0:j_idt129_input`) {
      break;
    }
    if (retry++ === 10) {
      throw new Error("checking input focus failed");
    }
    await sleep(200);
  }

  for (const c of code) {
    const handle = await page.evaluateHandle(() => document.activeElement);
    const el = handle.asElement();
    if (!el) throw new Error("no element found for input");

    await el.type(c);
    await sleep(100);
  }

  await navigate(page).byClick(MOBILE_ATTEND_SUBMIT_BUTTON);
}

async function getAttendResult(page: Page) {
  const result = await page.evaluate(() => {
    const e = document.querySelector(".signFlging")?.nextElementSibling;
    const textContentOf = (e?: Element | null) => e?.textContent?.trim() ?? "";
    return e === null ? e : textContentOf(e);
  });

  return result;
}
