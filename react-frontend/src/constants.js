const baseUrl = 'http://localhost:5000/';
export const tableStreamUrl = (table, idx) =>
  baseUrl + 'stream?table=' + table + '&file=' + idx;
export const usageStreamUrl = baseUrl + 'usage';
