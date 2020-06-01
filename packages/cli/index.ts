#!/usr/bin/env node
import cac from "cac";
import {
  getAttendance,
  askUserInfo,
  removeUserInfo,
  getGPA,
  getInfo,
  // getInfo,
  getTasks,
  saveGoogleCalendarCSV,
  withPage,
  getFS,
} from "@dhu/core";
import {
  renderLogo,
  renderAttendance,
  renderGPA,
  renderTaskMap,
  renderFS,
} from "./view";
const cli = cac();

cli
  // Simply omit the command name, just brackets
  .command("", "Log logo")
  .action(() => {
    renderLogo();
  });

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
  .option("--head", "launch headfully")
  .action(async (option) => {
    const data = await withPage(getGPA, { headless: !option.head });
    renderGPA(data);
  });

cli
  .command("atte", "Get attendance")
  .option("--head", "launch headfully")
  .action(async (option) => {
    const data = await withPage(getAttendance, { headless: !option.head });
    renderAttendance(data);
  });

cli
  .command("info", "Get info")
  .option("--head", "launch headfully")
  .action(async (option) => {
    const data = await withPage(getInfo, { headless: !option.head });
    console.log(data);
  });

cli
  .command("fs", "Get fs")
  .option("--head", "launch headfully")
  .action(async (option) => {
    const data = await withPage(getFS, { headless: !option.head });
    renderFS(data);
  });

cli
  .command("task", "Get tasks")
  .option("--head", "launch headfully")
  .option("--end", "show end tasks")
  .option("--empty", "show empty tasks")
  .action(async (option) => {
    const data = await withPage(getTasks, { headless: !option.head });
    renderTaskMap(data, { showEmpty: option.empty, showEnd: option.end });
  });

cli
  .command("timetable", "Download timetable csv")
  .option("--head", "launch headfully")
  .option("-q <q>", "quarter 1/2/3/4?")
  .option("-s, --start <start>", "first monday when quarter start")
  .action(async (option) => {
    /*const data = */ await withPage(
      (page) => saveGoogleCalendarCSV(page, option.q, option.start),
      {
        headless: !option.head,
      }
    );
    console.log("✨done");
  });

cli.help();
cli.version("0.0.14");
cli.parse();
