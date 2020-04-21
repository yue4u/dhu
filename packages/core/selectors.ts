export const URL = {
  TOP: `https://portal.dhw.ac.jp/uprx/`,
};

export const LOGIN = {
  ID: `#loginForm\\:userId`,
  PASSWORD: `#loginForm\\:password`,
  SUBMIT_BUTTON: `#loginForm\\:loginButton`,
} as const;

export const CHANGE_PASSWORD = {
  CURRENT: `#funcForm\\:password`,
  NEW: `#funcForm\\:j_idt174`,
  NEW_CONFIRM: `#funcForm\\:j_idt179`,
  SUBMIT_BUTTON: `#funcForm\\:j_idt198`,
} as const;

export const NAV = {
  TAB: `#menuForm\\:mainMenu > ul > li:nth-child(2) > a`,
  ATTENDANCE: `#menuForm\\:mainMenu > ul > li.ui-widget.ui-menuitem.ui-corner-all.ui-menu-parent.ui-menuitem-active > ul > table > tbody > tr > td:nth-child(1) > ul > li.ui-menuitem.ui-widget.ui-corner-all > a`,
} as const;
