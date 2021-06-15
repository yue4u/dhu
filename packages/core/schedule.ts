import { NAV_ATTENDANCE, NAV_SCHEDULE_LINK } from "./selectors";
import { parseAsync } from "json2csv";
import { navigate } from "./navigate";
import { LoginContext } from "./login";

export const timeMap = {
  1: ["08:40 AM", "10:10 AM"],
  2: ["10:20 AM", "11:50 AM"],
  3: ["12:40 PM", "14:10 PM"],
  4: ["14:20 PM", "15:50 PM"],
  5: ["16:00 PM", "17:30 PM"],
  6: ["17:40 PM", "19:10 PM"],
};

export type TimeMap = typeof timeMap;
export type Time = keyof TimeMap;

export type Lecture = {
  day: number;
  title: string;
  lecturer: string;
  code: string;
  unit: string;
  time: number;
};

export type CalendarEvent = {
  Subject: string;
  "Start Date": string;
  "Start Time"?: string;
  "End Date"?: string;
  "End Time"?: string;
  "All Day Event"?: boolean;
  Description?: string;
  Location?: string;
  Private?: boolean;
};

export async function getSchedule(
  { page }: LoginContext,
  q = 1
): Promise<Lecture[]> {
  await page.click(NAV_ATTENDANCE);
  await navigate(page).byClick(NAV_SCHEDULE_LINK);
  const schedule = await page.$eval(
    `(//table[contains(@class,"classTable")])[${q}]`,
    (table) => {
      const all: Lecture[] = [];

      const textContentOf = (e?: Element | null) =>
        e?.textContent?.trim() ?? "";
      const rows = Array.from(table.querySelectorAll("tbody tr"));
      rows.forEach((row, time) => {
        if (time === 2) {
          return;
        }
        if (time < 2) {
          time += 1;
        }
        const cells = Array.from(row.querySelectorAll("td .jugyo-info"));
        cells.forEach((cell, day) => {
          const [title, lecturer, _, code, unit] = Array.from(
            cell.querySelectorAll("div")
          ).map(textContentOf);
          if (!title) {
            return;
          }

          Array(8)
            .fill(0)
            .map((_, i) => {
              all.push({
                day: day + 1 + i * 7,
                title,
                time,
                lecturer,
                code,
                unit,
              });
            });
        });
      });

      return all;
    }
  );

  return schedule;
}

export async function saveGoogleCalendarCSV(
  ctx: LoginContext,
  q = 1,
  start = "2020-5-4"
) {
  const getDate = (days: number) => {
    const result = new Date(start);
    result.setDate(result.getDate() + days);
    return result;
  };

  const toGoogleEvent = (l: Lecture): CalendarEvent => {
    const time = timeMap[l.time as Time];
    const date = getDate(l.day).toISOString().split("T")[0];

    return {
      Subject: l.title,
      "Start Time": time[0],
      "End Time": time[1],
      "Start Date": date,
      "End Date": date,
      Description: [l.lecturer, l.code, l.unit].join("\n"),
    };
  };

  const schedule = await getSchedule(ctx, q);
  const csv = await parseAsync(schedule.map(toGoogleEvent));
  return csv;
}
