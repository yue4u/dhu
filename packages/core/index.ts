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

export { getInfo } from "./info";
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
export { saveGoogleCalendarCSV, getSchedule } from "./schedule";
export { getTasks, Task, TaskMap } from "./task";
export { getMaterials, Material, MaterialMap } from "./materials";
export {
  getOpenSyllabus,
  getSyllabus,
  getTotalCourseNumber,
  Course,
  Textbook,
} from "./syllabus";

export { waitForClickNavigation, sleep, match } from "./utils";
export * as SELECTORS from "./selectors";

export * from "playwright-chromium";
