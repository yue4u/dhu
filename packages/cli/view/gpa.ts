import chalk from "chalk";
import { GPA } from "@dhu/core";

export function renderGPA(data: GPA[]) {
  data.forEach((row) => {
    // HACK: fix whitespace in terminal
    console.log(
      `${row.semester.padEnd(15)}${
        row.semester === "通算" ? "  " : ""
      }| ${chalk.green(row.gpa)}`
    );
  });
}
