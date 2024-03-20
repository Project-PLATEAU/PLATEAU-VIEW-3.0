import moment from "moment";

export const dateTimeFormat = (date?: Date | string, format = "YYYY-MM-DD HH:mm", local = true) => {
  return local ? `${moment.utc(date).local().format(format)}` : `${moment(date).format(format)}`;
};

export const bytesFormat = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export const transformMomentToString = (value: any) => {
  if (moment.isMoment(value)) {
    return value.format("YYYY-MM-DDTHH:mm:ssZ");
  }

  if (Array.isArray(value) && value.every(item => moment.isMoment(item))) {
    return value.map(item => item.format("YYYY-MM-DDTHH:mm:ssZ"));
  }

  return value; // return the original value if it's neither a moment object nor an array of moment objects
};
