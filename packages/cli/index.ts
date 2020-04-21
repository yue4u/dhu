import dotenv from "dotenv";
dotenv.config();
import { login, getAttendance } from "@dhu/core";
import { renderAttendance } from "./view";
const { DIGICAM_ID, DIGICAM_PASSWORD } = process.env;
if (!DIGICAM_ID || !DIGICAM_PASSWORD) {
  throw Error("no login info");
}

(async () => {
  const { page, browser } = await login({
    id: DIGICAM_ID,
    password: DIGICAM_PASSWORD,
  });
  const data = await getAttendance(page);
  renderAttendance(data);
  await browser.close();
})();
