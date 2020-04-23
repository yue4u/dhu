#!/usr/bin/env node
import cac from "cac";
import { login, getAttendance, askUserInfo, removeUserInfo } from "@dhu/core";
import { renderAttendance } from "./view";
const cli = cac();

cli
  .command("atte", "Get attendance")
  .option("--head", "lunch headfully")
  .action(async (option) => {
    const { page, browser } = await login({ headless: !option.head });
    const data = await getAttendance(page);
    renderAttendance(data);
    await browser.close();
  });

cli // keep format
  .command("login", "Save login info to local data path")
  .action(async () => {
    await askUserInfo();
  });

cli // keep format
  .command("logout", "Remove login info from local data path")
  .action(async () => {
    await removeUserInfo();
  });

cli.help();
cli.version("0.0.5");
cli.parse();
