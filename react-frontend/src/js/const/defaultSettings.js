export const startSec = new Date(2015, 7, 18, 0, 0, 0).getTime() / 1000;
export const endSec = new Date(2015, 8, 18, 0, 0, 0).getTime() / 1000;

export const initSettings = () => ({
  measure: 0,
  field: 0,
  start: startSec,
  end: endSec,
  step: 6 * 60,
  freq: 1000,
});
