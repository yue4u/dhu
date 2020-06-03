import path from "path";
import type { Course } from "@dhu/core";
import { promises as fs } from "fs";
import syllabusData from "../data/syllabus.json";

export const sortData = (data: Course[]) => {
  return data.sort((a, b) => Number(a.code > b.code));
};

(async () => {
  const data = sortData(syllabusData);
  await fs.writeFile(
    path.join(__dirname, "../data/syllabus.json"),
    JSON.stringify(data, null, 4),
    {
      encoding: "utf8",
    }
  );
})();
