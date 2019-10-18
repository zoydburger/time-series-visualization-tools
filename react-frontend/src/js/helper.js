export const timestampToPlotlyTimestamp = timestamp => {
  const timestampMS = timestamp / 1000.0;
  const startDate = new Date(2011, 4, 1, 19, 0, 0, 0).getTime();
  const timestampDate = new Date(startDate + timestampMS);
  const plotlyTimestamp = dateToPlotlyTimestamp(timestampDate);
  return plotlyTimestamp;
};

export const pad = (num, size) => ('000000' + num).substr(-size);

export const dateToPlotlyTimestamp = date => {
  const year = pad(date.getFullYear(), 4);
  const month = pad(date.getMonth() + 1, 2);
  const day = pad(date.getDate(), 2);
  const h = pad(date.getHours(), 2);
  const m = pad(date.getMinutes(), 2);
  const s = pad(date.getSeconds(), 2);
  const ms = pad(date.getMilliseconds(), 3);
  return (
    year + '-' + month + '-' + day + ' ' + h + ':' + m + ':' + s + '.' + ms
  );
};

export const plotlyTimestampToDate = plotlyTimestamp => {
  const tsSplit = plotlyTimestamp.split(' ');
  const date = tsSplit[0].split('-');
  const time = tsSplit[1].split(':');
  const result = new Date(date[0], date[1] - 1, date[2], time[0], time[1]);
  if (time[2].indexOf('.') > -1) {
    const secondSplit = time[2].split('.');
    result.setSeconds(secondSplit[0]);
    result.setMilliseconds(secondSplit[1]);
  } else {
    result.setSeconds(time[2]);
  }
  return result;
};

export const influxToPlotyTimestamp = influxTimestamp => {
  let plotlyTimestamp = influxTimestamp.replace('T', ' ');
  plotlyTimestamp = plotlyTimestamp.replace('Z', '');
  return plotlyTimestamp;
};

export const simulateError = value => {
  const deviationUp = Math.random() * 15.0;
  const deviationDown = Math.random() * 15.0;
  value += value * (Math.random() / deviationUp);
  value -= value * (Math.random() / deviationDown);
  return value;
};
