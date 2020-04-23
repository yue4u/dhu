export const sleep = (timeout: number) => {
  return new Promise((done) => setTimeout(done, timeout));
};

export const textContentOf = (e?: Element | null) =>
  e?.textContent?.trim() ?? "";
