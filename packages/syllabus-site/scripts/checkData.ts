import { withPage, getTotalCourseNumber } from "@dhu/core";
import syllabusData from "../data/syllabus.json";
(async () => {
  const webLength = await withPage(getTotalCourseNumber, { headless: false });
  console.log(`local: ${syllabusData.length} === web: ${Number(webLength)}`);
  console.log(syllabusData.length === Number(webLength));
})();
