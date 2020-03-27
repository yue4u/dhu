export const URL = {
  TOP: `https://portal.dhw.ac.jp/uprx/`
};

export const LOGIN = {
  ID: `#loginForm\\:userId`,
  PASSWORD: `#loginForm\\:password`,
  SUBMIT_BUTTON: `#loginForm\\:loginButton`
} as const;

export const CHANGE_PASSWORD = {
  CURRENT: `#funcForm\\:password`,
  NEW: `#funcForm\\:j_idt174`,
  NEW_CONFIRM: `#funcForm\\:j_idt179`,
  SUBMIT_BUTTON: `#funcForm\\:j_idt198`
} as const;
