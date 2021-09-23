import { array, Describe, object, string, enums, assert } from "superstruct";
import fetch from "node-fetch";
import fs from "fs-extra";
import { getUserData, updateUserData } from "./userData";

export interface ZoomInfo {
  title: string;
  meetingId: string;
  password: string;
  day: "月" | "火" | "水" | "木" | "金" | "土";
}

const getDayNumber = (day: ZoomInfo["day"]) => {
  return { 月: 1, 火: 2, 水: 3, 木: 4, 金: 5, 土: 6 }[day];
};

function validateZoomInfo(value: unknown): asserts value is ZoomInfo[] {
  const zoomInfoSchema: Describe<ZoomInfo> = object({
    title: string(),
    meetingId: string(),
    password: string(),
    day: enums(["月", "火", "水", "木", "金", "土"]),
  });
  const schema: Describe<ZoomInfo[]> = array(zoomInfoSchema);
  assert(value, schema);
}

async function updateZoomInfo(data: ZoomInfo[]) {
  await updateUserData((config) => {
    config.zoom = data;
  });
}

async function doImport(data: unknown) {
  validateZoomInfo(data);
  await updateZoomInfo(data);
  console.log("Imported zoom data:");
  console.log(JSON.stringify(data, null, 4));
  console.log("✨done");
}

export const zoom = {
  async importFromUrl(url: string) {
    const res = await fetch(url);
    const data = await res.json();
    await doImport(data);
  },

  async importFromFile(path: string) {
    const data = await fs.readJSON(path);
    await doImport(data);
  },

  async list(): Promise<ZoomInfo[]> {
    const data = await getUserData();
    return data?.zoom || [];
  },

  async listToday(): Promise<ZoomInfo[]> {
    const info = await zoom.list();
    const today = new Date().getDay();
    return info.filter((meeting) => getDayNumber(meeting.day) === today);
  },

  getUrl(meeting: ZoomInfo) {
    // somehow outdated, but still partially works
    // https://medium.com/zoom-developer-blog/zoom-url-schemes-748b95fd9205
    const query = new URLSearchParams({
      stype: "1",
      action: "join",
      confno: meeting.meetingId.replaceAll(" ", ""),
      pwd: meeting.password,
    });
    return `zoommtg://zoom.us/join?${query}`;
  },
};
