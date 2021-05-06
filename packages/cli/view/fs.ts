import chalk, { Chalk } from "chalk";
import { FS } from "@dhu/core";

const map: Record<string, Chalk> = {
  回答済: chalk.green,
  未回答: chalk.cyan,
  "*": chalk,
};

export function renderFS(data: FS[]) {
  data.forEach((row) => {
    const color = map[row.status] ?? map["*"];
    console.log(
      `${color(row.status.padEnd(4))} ${chalk.magenta(
        row.deadline
      )} ${chalk.gray(row.title)}`
    );
  });
}
