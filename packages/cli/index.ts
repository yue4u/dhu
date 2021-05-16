#!/usr/bin/env node
import cac from "cac";
import path from "path";
import chalk from "chalk";
import latestVersion from "latest-version";
import {
  match,
  getAttendance,
  removeUserInfo,
  getGPA,
  getInfo,
  getTasks,
  getMaterials,
  saveGoogleCalendarCSV,
  withLogin,
  configKeys,
  getUserConfig,
  updateUserConfig,
} from "@dhu/core";
import {
  renderLogo,
  renderLogin,
  renderAttendance,
  renderGPA,
  renderTaskMap,
  renderMaterialMap,
  fs,
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
  .option("-c,--content", "get content info")
  .option("-a,--attachments", "download attachments")
  .option("--dir <dir>", "path to save download attachments")
  .action(async (option) => {
    const { all, attachments, content, dir } = option;
    const getInfoOptions = {
      all: Boolean(all),
      content: Boolean(content),
      attachments: Boolean(attachments),
      dir: dir ?? process.cwd(),
    };
    const data = await withLogin(
      async (page) => getInfo(page, getInfoOptions),
      {
        headless: !option.head,
      }
    );
    await match(data);
  });

cli
  .command("fs", "Get fs")
  .option("--head", "launch headfully")
  .action(async (option) => {
    await withLogin(fs.write, { headless: !option.head });
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
  .command("matl", "Get Materials")
  .option("--head", "launch headfully")
  .option("--dir <dir>", "path to save download attachments")
  .action(async (option) => {
    const getDir = async () => {
      if (option.dir) return option.dir;
      const config = await getUserConfig();
      if (config?.syncDir) return config.syncDir;
      return path.join(process.cwd(), ".dhu-sync");
    };

    const dir = await getDir();
    console.log(chalk`syncing data with {cyan ${dir}}`);

    const result = await withLogin((ctx) => getMaterials(ctx, { dir }), {
      headless: !option.head,
    });

    await match(result, {
      ok(data) {
        renderMaterialMap(data);
      },
    });
  });

cli
  .command("config [...kv]", "Set config")
  .option("-s,--show", "Show key")
  .option("-d,--delete", "Show key")
  .action(async (kv: string[], option) => {
    if (kv.length < 1) {
      console.log(`usage: dhu config --show key`);
      console.log(`       dhu config key value`);
      return;
    }

    const [k, v] = kv;

    if (!configKeys.has(k)) {
      console.error(
        `unknown key ${k}, expected: ${Array.from(configKeys.keys()).join()}`
      );
      return;
    }

    if (option.show) {
      const config = await getUserConfig();
      // @ts-ignore
      console.log(config?.[k]);
      return;
    }

    if (option.delete) {
      await updateUserConfig(k, undefined);
      return;
    }

    if (!v) {
      console.log(`dhu config key value`);
      return;
    }

    await updateUserConfig(k, v);
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

async function checkVersion() {
  const ver = await latestVersion(pkg.name);
  if (ver === pkg.version) return;
  console.log(
    chalk.yellow
      .bold`A new version of ${pkg.name} {cyan.bold ${ver}} (currently ${pkg.version}) has been released, try run {cyan.bold \`yarn global add @dhu/cli\`} to upgrade.`
  );
}

async function run() {
  await checkVersion();
  cli.parse();
}

run();
