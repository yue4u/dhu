export * from "playwright-chromium";
export {
  login,
  withBrowser,
  withPage,
  withLogin,
  LoginContext,
  Result,
  LoginOptions,
} from "./login";

export {
  Attendance,
  AttendanceRecord,
  AttendanceRecordMark,
  attendanceStatusMap,
  getAttendance,
} from "./attendance";

export {
  saveUserInfo,
  getUserInfo,
  readUserInfo,
  removeUserInfo,
  getUserConfig,
  updateUserConfig,
  configKeys,
} from "./userInfo";

export { getInfo, getInfoItemByIndex, Info, GetInfoOptions } from "./info";

export {
  getFS,
  fillFS,
  FS,
  FSAnswer,
  FS_QUESTIONS,
  FSForm,
  FSFormAnswers,
  FSQuestion,
  FSQuestionSchema,
} from "./fs";
export { getGPA, GPA } from "./grade";
export {
  saveGoogleCalendarCSV,
  getSchedule,
  timeMap,
  TimeMap,
  Time,
  Lecture,
  CalendarEvent,
} from "./schedule";
export { getTasks, Task, TaskMap, Attachment } from "./task";
export { getMaterials, Material, MaterialMap } from "./materials";
export {
  getOpenSyllabus,
  getSyllabus,
  getTotalCourseNumber,
  Course,
  Textbook,
} from "./syllabus";
export { waitForClickNavigation, sleep, match, navigate } from "./utils";
export * as SELECTORS from "./selectors";

export * from "playwright-chromium";
