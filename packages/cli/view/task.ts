import chalk from "chalk";
import { TaskMap } from "@dhu/core";

type RenderTaskOptions = {
  showEmpty?: boolean;
  showEnd?: boolean;
};

const statusColorMap: Record<string, Function> = {
  提出終了: chalk.green,
  受付終了: chalk.grey,
  受付開始前: chalk.magentaBright,
  提出受付中: chalk.cyan,
  "*": chalk.white,
};

export const renderTask = (
  data: TaskMap,
  { showEmpty, showEnd }: RenderTaskOptions
) => {
  Object.entries(data).forEach(([subject, tasks]) => {
    if (!tasks.length && !showEmpty) {
      return;
    }
    console.log(chalk.whiteBright.bold(`> ${subject}`));
    tasks.forEach((t, i) => {
      if (t.status === "受付終了" && !showEnd) {
        return;
      }
      let row: Array<string | undefined> = [chalk.yellow(`  ${i + 1})`)];
      const color = statusColorMap[t.status ?? "*"];
      row.push(`${color(t.status)}`.padEnd(10));
      row.push(chalk.magenta(t.deadline));
      row.push(chalk.gray(t.name));

      console.log(row.join(" "));
    });
    console.log(" ");
  });
};
