#!/usr/bin/env node
import cac from "cac";
import { login, getAttendance } from "@dhu/core";
import { renderAttendance } from "./view";
const cli = cac();

cli.command("atte", "get attendance").action(async () => {
  const { page, browser } = await login();
  const data = await getAttendance(page);
  renderAttendance(data);
  await browser.close();
});

cli.help();
cli.version("0.0.3");
cli.parse();
