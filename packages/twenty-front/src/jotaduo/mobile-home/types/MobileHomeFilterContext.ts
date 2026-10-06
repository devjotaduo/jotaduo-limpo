// What the home's record filters depend on: who is looking and which day it
// is for them.
export type MobileHomeFilterContext = {
  currentWorkspaceMemberId: string;
  dayStart: string;
  dayEnd: string;
};
