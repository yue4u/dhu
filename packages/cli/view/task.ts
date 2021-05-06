import chalk, { Chalk } from "chalk";
import { Task, TaskMap } from "@dhu/core";

type RenderTaskMapOptions = {
  showEmpty?: boolean;
  showEnd?: boolean;
};

const statusColorMap: Record<string, Chalk> = {
  提出終了: chalk.green,
  受付終了: chalk.grey,
  受付開始前: chalk.magentaBright,
  提出受付中: chalk.cyan,
  "*": chalk.white,
};

export const renderTaskMap = (
  data: TaskMap,
  { showEmpty, showEnd }: RenderTaskMapOptions
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
      renderTask(t, i);
    });
    console.log(" ");
  });
};

const renderTask = (t: Task, i: number) => {
  const color = statusColorMap[t.status ?? "*"];
  const row = [
    chalk.yellow(`  ${i + 1})`),
    `${color(t.status)}`.padEnd(10),
    chalk.magenta(t.deadline),
    chalk.gray(t.name),
  ].join(" ");

  console.log(row);
};
