import Axios from 'axios';
import { measurementsNOAA } from './constants';
import papaparse from 'papaparse';

const token =
  '9wtEw-MLLjCL-sQIiTRtpdx_F0huCN8uwVmkzdi2woUiZoDDTI2OUs0tW7MSJjCG_3JCq1quL7saBbcqh1S3hQ==';
const org = 'tum';
const accept = 'application/csv';
const contentType = 'application/vnd.flux';
const influx = 'http://localhost:9999/api/v2/query?org=' + org;

const options = {
  method: 'post',
  url: influx,
  headers: {
    Authorization: 'Token ' + token,
    Accept: accept,
    'Content-type': contentType,
  },
};

export const influxToJson = csv => {
  let tables = splitTables(csv);
  console.log(tables);
  tables = tables.map(table => {
    const data = papaparse.parse(table, { header: true }).data;
    return data;
  });
  return tables;
};

const splitTables = csv => {
  if (csv == '\r\n') return [];
  const tables = csv.split('\r\n\r\n');
  while (tables.indexOf('') != -1) tables.splice(tables.indexOf(''), 1);
  return tables;
};

const influxQuery = async query => {
  const request = options;
  request.data = query;
  return Axios.request(request).then(res => {
    console.log(res);
    if (res.data) {
      return influxToJson(res.data);
    }
  });
};

export const queryNOAAMetric = (mIdx, fIdx, start, stop) => {
  start = Math.round(start / 1000);
  stop = Math.round(stop / 1000);
  const measurement = measurementsNOAA[mIdx].measurement;
  const field = measurementsNOAA[mIdx].fields[fIdx].name;
  let query = 'from(bucket: "noaa-data")';
  query += '|> range(start: ' + start + ', stop: ' + stop + ')';
  query += '|> filter(fn: (r) => r._measurement == "' + measurement + '")';
  query += '|> filter(fn: (r) => r._field == "' + field + '")';
  return influxQuery(query);
};

// export const getAvgTemp = (start, stop) => {
//   const query = avgTempQuery(start, stop);
//   return influxQuery(query);
// };

// const queryDatabase = () => {};

// const influxQuery = (bucket, start, end, measurement, field, aggregation) => {
//   return (
//     influxQueryBucket(bucket) +
//     influxQueryRange(start, end) +
//     influxQueryFilter(measurement, field)
//   );
// };

// const influxQueryBucket = name => 'from(bucket: "' + name + '") ';
// const influxQueryRange = (start, end) =>
//   '|> range(start: ' + start + ', stop: ' + end + ') ';
// const influxQueryFilter = (measurement, field) => {
//   return (
//     '|> filter(fn:(r) => ' +
//     'r._measurement == "' +
//     measurement +
//     '" and ' +
//     'r._field == "' +
//     field +
//     '")'
//   );
// };
