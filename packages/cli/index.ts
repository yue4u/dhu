import dotenv from "dotenv";
dotenv.config();
import cac from "cac";
import { login, getAttendance } from "@dhu/core";
import { renderAttendance } from "./view";
const { DIGICAM_ID, DIGICAM_PASSWORD } = process.env;
if (!DIGICAM_ID || !DIGICAM_PASSWORD) {
  throw Error("no login info");
}

(async () => {
  const cli = cac();
  cli.command("atte", "get attendance").action(async () => {
    const { page, browser } = await login({
      id: DIGICAM_ID,
      password: DIGICAM_PASSWORD,
    });
    const data = await getAttendance(page);
    renderAttendance(data);
    await browser.close();
  });

  cli.help();
  cli.version("0.0.1");
  cli.parse();
})();
