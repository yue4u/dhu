import path from "path";
import { promises as fs } from "fs";
import { createHash } from "crypto";
import { Course } from "@dhu/core";

import syllabusData from "../data/syllabus.json";

const hash = (text: string) => {
  return createHash("md5").update(text).digest("hex").slice(0, 8);
};

const hashStore: Record<string, string> = {};

export const uniqueHash = (text: string) => {
  let hashString = "";
  // eslint-disable-next-line no-constant-condition
  while (true) {
    hashString = hash(text);

    if (hashString in hashStore) {
      hashString = hash(hashString);
    } else {
      hashStore[text] = hashString;
      hashStore[hashString] = text;
      break;
    }
  }
  return hashString;
};

type SearchData = {
  text: string;
  type: string;
  title: string;
  id: string;
};

export async function buildSeachData(data: Course[]) {
  const teacherList: string[] = [];
  const searchData: SearchData[] = [];

  for (const course of data) {
    const contents = (course.contents || []).join(" ");
    const textbooks = (course.textbooks || [])
      .map((t) => Object.values(t).join(" "))
      .join(" ");
    delete course.contents;
    delete course.textbooks;
    const other = Object.values(course).join(" ");

    const text = `${other} ${contents} ${textbooks}`;

    if (!teacherList.includes(course.teacher)) {
      searchData.push({
        text: course.teacher,
        type: "teacher",
        title: "教員",
        id: uniqueHash(`teacher:${course.teacher}`),
      });

      teacherList.push(course.teacher);
    }
    searchData.push({
      text,
      type: "course",
      title: course.title,
      id: course.code,
    });
  }
  return searchData;
}

(async () => {
  const data = await buildSeachData(syllabusData);
  await fs.writeFile(
    path.join(__dirname, "../data/search.json"),
    JSON.stringify(data, null, 4),
    {
      encoding: "utf8",
    }
  );
})();
