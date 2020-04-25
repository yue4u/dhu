#!/usr/bin/env node
import cac from "cac";
import {
  getAttendance,
  askUserInfo,
  removeUserInfo,
  getGPA,
  withPage,
} from "@dhu/core";
import { renderAttendance, renderGPA } from "./view";
const cli = cac();

cli // keep format
  .command("login", "Save login info to local data path")
  .action(async () => {
    await askUserInfo();
  });

cli
  .command("logout", "Remove login info from local data path")
  .action(async () => {
    await removeUserInfo();
  });

cli
  .command("gpa", "Get GPA")
  .option("--head", "lunch headfully")
  .action(async (option) => {
    const data = await withPage(getGPA, { headless: !option.head });
    renderGPA(data);
  });

cli
  .command("atte", "Get attendance")
  .option("--head", "lunch headfully")
  .action(async (option) => {
    const data = await withPage(getAttendance, { headless: !option.head });
    renderAttendance(data);
  });

cli.help();
cli.version("0.0.7");
cli.parse();
