#!/usr/bin/env node
import cac from "cac";
import {
  match,
  getAttendance,
  removeUserInfo,
  getGPA,
  getInfo,
  getTasks,
  saveGoogleCalendarCSV,
  withLogin,
  getFS,
} from "@dhu/core";
import {
  renderLogo,
  renderLogin,
  renderAttendance,
  renderGPA,
  renderTaskMap,
  renderFS,
} from "./view";
import pkg from "@dhu/cli/package.json";
const cli = cac();

cli.command("", "Log logo").action(renderLogo);

cli.command("login", "Save login info to local data path").action(renderLogin);

cli
  .command("logout", "Remove login info from local data path")
  .action(removeUserInfo);

cli
  .command("gpa", "Get GPA")
  .option("--head", "launch headfully")
  .action(async (option) =>
    match(await withLogin(getGPA, { headless: !option.head }), {
      ok: renderGPA,
    })
  );

cli
  .command("atte", "Get attendance")
  .option("--head", "launch headfully")
  .option("-q <q>", "quarter 1/2/3/4")
  .action(async (option) => {
    option.q &&= parseInt(option.q);
    const result = await withLogin((page) => getAttendance(page, option.q), {
      headless: !option.head,
    });
    await match(result, {
      ok: renderAttendance,
    });
  });

cli
  .command("info", "Get info")
  .option("--all", "retrieve all info")
  .option("--head", "launch headfully")
  .option("--attachments", "download attachments")
  .option(
    "--downloadsPath <downloadsPath>",
    "path to save download attachments"
  )
  .action(async (option) => {
    const { attachments, downloadsPath } = option;
    const options = {
      all: Boolean(option.all),
      attachments: Boolean(attachments),
      downloadsPath: downloadsPath ?? process.cwd(),
    };
    const data = await withLogin(async (page) => getInfo(page, options), {
      headless: !option.head,
    });
    await match(data);
  });

cli
  .command("fs", "Get fs")
  .option("--head", "launch headfully")
  .action(async (option) => {
    const result = await withLogin(getFS, { headless: !option.head });
    await match(result, { ok: renderFS });
  });

cli
  .command("task", "Get tasks")
  .option("--head", "launch headfully")
  .option("--end", "show end tasks")
  .option("--empty", "show empty tasks")
  .option("-q <q>", "quarter 1/2/3/4")
  .action(async (option) => {
    const result = await withLogin(
      (ctx) => getTasks(ctx, parseInt(option.q, 10)),
      { headless: !option.head }
    );
    await match(result, {
      ok(data) {
        const renderOptions = { showEmpty: option.empty, showEnd: option.end };
        renderTaskMap(data, renderOptions);
      },
    });
  });

cli
  .command("timetable", "Download timetable csv")
  .option("--head", "launch headfully")
  .option("-q <q>", "quarter 1/2/3/4?")
  .option("-s, --start <start>", "first monday when quarter start")
  .action(async (option) => {
    await withLogin(
      (ctx) => saveGoogleCalendarCSV(ctx, option.q, option.start),
      {
        headless: !option.head,
      }
    );
    console.log("✨done");
  });

cli.help();
cli.version(pkg.version);
cli.parse();
