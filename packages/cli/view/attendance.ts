import chalk from "chalk";
import { Attendance } from "@dhu/core";

export function render(data: Attendance[]) {
  data.map((row) => renderRow(row));
}

export function renderRow(a: Attendance) {
  console.log(chalk.whiteBright.bold(`> ${a.title} ${a.code}`));
  let recordLog = [chalk.yellow(`  ${a.rate}`.padEnd(9))];

  for (let record of a.records) {
    //record.date = record.date.padEnd(5);
    switch (record.status) {
      case "出席": {
        recordLog.push(chalk.black.bgGreen(record.date));
        break;
      }
      case "公欠": {
        recordLog.push(chalk.black.bgCyan(record.date));
        break;
      }
      case "遅刻": {
        recordLog.push(chalk.black.bgRed(record.date));
        break;
      }
      case "欠席": {
        recordLog.push(chalk.black.bgRed(record.date));
        break;
      }
      case "休講": {
        recordLog.push(chalk.white.bgGray(record.date));
        break;
      }
      default: {
        recordLog.push(chalk.white(record.date));
      }
    }
  }
  console.log(recordLog.join(" "));
}
