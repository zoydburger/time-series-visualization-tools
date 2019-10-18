import { getGraphData } from './mqttClient';
import { simulateError } from './helper';

const graphWidth = 1200;
const graphHeight = 600;

export const standardLayout = {
  width: graphWidth,
  height: graphHeight,
  title: 'Empty Graph',
};

const emptyGraph = {
  lines: {},
  layout: standardLayout,
};

export const graphTypes = {
  '': [],
  job_events: ['accumulate'],
};

export const getGraph = (table, type, data) => {
  if (type === 'accumulate') {
    return scatterGraph(table, type, data);
  } else if (type === 'forecast') {
    return forecastGraph(table, type, data);
  } else {
    return emptyGraph;
  }
};

// export const scatterLine = (x, y, label) => {
//   return {
//     x: x,
//     y: y,
//     name: label,
//     type: 'scatter',
//   };
// };

export const forecastGraph = (time, values, forecasts, timeForecasts) => {
  const lines = {
    real: {
      x: time,
      y: values,
      mode: 'lines',
      name: 'Real data',
      line: {
        dash: 'solid',
        widht: 4,
      },
    },
    forecast: {
      x: timeForecasts,
      y: forecasts,
      mode: 'lines',
      name: 'Forecasted data',
      line: {
        dash: 'dot',
        width: 4,
      },
    },
  };
  const layout = {
    width: graphWidth,
    height: graphHeight,
    title: 'Table <' + 'Fake' + '> | Type <' + 'Forecasts' + '>',
    shapes: [],
  };
  return {
    lines: lines,
    layout: layout,
  };
};

const scatterGraph = (table, type, data) => {
  const time = data.x;
  const attributes = data.y;
  const lines = {};
  for (let key in attributes) {
    lines[key] = {
      x: time,
      y: attributes[key],
      name: key,
      type: 'scattergl',
    };
  }
  const layout = {
    width: graphWidth,
    height: graphHeight,
    title: 'Table <' + table + '> | Type <' + type + '>',
  };
  return {
    lines: lines,
    layout: layout,
  };
};

// const allEventsGraph = () => {
//   const data = eventData;
//   const lines = {
//     pending: {
//       x: data.time,
//       y: data.pending,
//       name: 'pending',
//       type: 'scatter',
//     },
//     running: {
//       x: data.time,
//       y: data.running,
//       name: 'running',
//       type: 'scatter',
//     },
//     dead: {
//       x: data.time,
//       y: data.dead,
//       name: 'dead',
//       type: 'scatter',
//     },
//     finish: {
//       x: data.time,
//       y: data.finish,
//       name: 'finish',
//       type: 'scatter',
//     },
//   };
//   const layout = {
//     width: graphWidth,
//     height: graphHeight,
//     title: 'All Events',
//   };
//   return {
//     data: Object.values(lines),
//     layout: layout,
//   };
// };

// const diffCountGraph = () => {
//   const lines = {
//     scheduled: {
//       x: diffData.time,
//       y: diffData.scheduled,
//       name: 'Scheduled Jobs',
//       type: 'bar',
//     },
//     submit: {
//       x: diffData.time,
//       y: diffData.submit,
//       name: 'New Jobs',
//       type: 'bar',
//     },
//     resubmit: {
//       x: diffData.time,
//       y: diffData.resubmit,
//       name: 'Re-submitted Jobs',
//       type: 'bar',
//     },
//     deschedule_pending: {
//       x: diffData.time,
//       y: diffData.deschedule_pending,
//       name: 'Descheduled from Pending',
//       type: 'bar',
//     },
//     deschedule_running: {
//       x: diffData.time,
//       y: diffData.deschedule_running,
//       name: 'Descheduled from Running',
//       type: 'bar',
//     },
//   };

//   const layout = {
//     width: graphWidth,
//     height: graphHeight,
//     title: 'Difference per Minute',
//   };
//   return {
//     data: Object.values(lines),
//     layout: layout,
//   };
// };
