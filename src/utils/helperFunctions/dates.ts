import moment from "moment";

export function sortByDateString(dateStringA: string, dateStringB: string) {
  const momentA = moment(dateStringA);
  const momentB = moment(dateStringB);
  if (momentA.isBefore(momentB)) {
    return -1;
  } else if (momentB.isBefore(momentA)) {
    return 1;
  }
  return 0;
}

export function sortObjArrayByDateString(
  objArray: any[],
  dateStringKey: string
) {
  if (!dateStringKey || !objArray.length) {
    return objArray;
  }
  return objArray.sort((itemA: any, itemB: any) => {
    const dateA = itemA[dateStringKey];
    const dateB = itemB[dateStringKey];
    if (!dateA || !dateB) {
      return 0;
    }
    return sortByDateString(dateA, dateB);
  });
}
