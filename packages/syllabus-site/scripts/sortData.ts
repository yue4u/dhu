import path from "path";
import { promises as fs } from "fs";
import syllabusData from "../data/syllabus.json";

(async () => {
  const data = syllabusData.sort((a, b) => Number(a.code > b.code));
  await fs.writeFile(
    path.join(__dirname, "../data/syllabus.json"),
    JSON.stringify(data, null, 4),
    {
      encoding: "utf8",
    }
  );
})();
