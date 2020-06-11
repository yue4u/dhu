import { withPage, getTotalCourseNumber } from "@dhu/core";

(async () => {
  const data = await withPage(getTotalCourseNumber);
  console.log(data);
})();
