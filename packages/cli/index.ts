import { login } from "@dhu/core";

const { DIGICAM_ID, DIGICAM_PASSWORD } = process.env;
if (!DIGICAM_ID || !DIGICAM_PASSWORD) {
  throw Error("no login info");
}

login({ id: DIGICAM_ID, password: DIGICAM_PASSWORD });
