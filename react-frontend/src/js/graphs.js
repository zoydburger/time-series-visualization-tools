import {
  influxToPlotyTimestamp,
  plotlyTimestampToDate,
  dateToPlotlyTimestamp,
} from './helper';
import { startNOAAData } from './constants';

const graphWidth = 1000;
const graphHeight = 420;

export const chartTypes = {
  scatter: 'Line / Scatter',
  bar: 'Bar Chart',
};

export const standardLayout = {
  width: graphWidth,
  height: graphHeight,
  title: 'Empty Graph',
  layoutrevision: 0,
};

const forecastTraceProperties = () => {
  return {
    normal: {
      name: 'Data Trace',
      type: 'scatter',
      line: { color: 'rgb(22, 156, 57)', width: 2 },
    },
    forecast: {
      name: 'Forecast',
      type: 'scatter',
      line: { color: 'rgb(173, 14, 14)', width: 1, dash: 'dashdot' },
    },
    lowerError: {
      name: 'Upper Error Band',
      type: 'scatter',
      fill: 'tonexty',
      fillcolor: 'rgba(100, 29, 181, 0.4)',
      line: { width: 0 },
      marker: { color: '444' },
    },
    upperError: {
      name: 'Lower Error Band',
      type: 'scatter',
      fill: 'tonexty',
      fillcolor: 'rgba(252, 88, 88, 0.4)',
      line: {
        width: 0,
      },
    },
  };
};

const verticalDivider = cut => {
  return [
    {
      type: 'line',
      yref: 'paper',
      x0: cut,
      x1: cut,
      y0: -0.1,
      y1: 1.1,
      line: {
        color: 'rgb(49, 5, 66)',
        width: 2,
        dash: 'dot',
      },
    },
    {
      type: 'line',
      yref: 'paper',
      x0: cut,
      x1: cut,
      y0: -0.1,
      y1: 1.1,
      opacity: 0.5,
      line: {
        color: 'rgb(55, 128, 191)',
        width: 8,
      },
    },
  ];
};

export const emptyForecastLayout = () => {
  return {
    title: 'Forecasted Time-Series',
    width: graphWidth,
    height: graphHeight,
    shapes: [],
    xaxis: {
      type: 'date',
      autorange: false,
    },
  };
};

const forecastLayout = (start, end, cut) => {
  return {
    title: 'Forecasted Time-Series',
    width: graphWidth,
    height: graphHeight,
    shapes: verticalDivider(cut),
    xaxis: {
      type: 'date',
      range: [start, end],
      autorange: false,
    },
  };
};

export const createForecastGraph = inputGraph => {
  const split = splitTrace(inputGraph);
  if (split) {
    const data = createForecastGraphTraces(split.traceData);
    const layout = forecastLayout(split.start, split.end, split.cut);
    return {
      data: data,
      layout: layout,
    };
  }
  return undefined;
};

const splitTrace = inputGraph => {
  if (inputGraph.x.length >= 10) {
    const xNew = inputGraph.x.slice();
    const yNew = inputGraph.y.slice();
    let xMin = plotlyTimestampToDate(xNew[0]);
    let xMax = plotlyTimestampToDate(xNew[xNew.length - 1]);
    let cutTime = xMin.getTime() + 0.7 * (xMax.getTime() - xMin.getTime());
    const cutDate = new Date(cutTime);
    const insertIdx = xNew.findIndex(function(element) {
      return plotlyTimestampToDate(element).getTime() > cutTime;
    });
    if (insertIdx != -1 && insertIdx < xNew.length - 1) {
      const interpolatedVal =
        (Number(yNew[insertIdx - 1]) + Number(yNew[insertIdx - 2])) / 2.0;
      xNew.splice(insertIdx, 0, dateToPlotlyTimestamp(cutDate));
      yNew.splice(insertIdx, 0, interpolatedVal);
    }
    const maxY = Math.max(...yNew);
    const minY = Math.min(...yNew);
    const errorBand = 0.2 * ((maxY - minY) / 2.0);
    const xTrace = xNew.slice(0, insertIdx + 1);
    const yTrace = yNew.slice(0, insertIdx + 1);
    const xForecast = xNew.slice(insertIdx);
    let yForecast = yNew.slice(insertIdx);
    const yErrHi = [];
    const yErrLo = [];
    // Add increasing error with increasing index
    //let errorStart = 0.01;
    //let window = yForecast.length;
    yForecast = yForecast.map((value, idx) => {
      yErrHi.push(Number(value) + Number(errorBand));
      yErrLo.push(Number(value) - Number(errorBand));
      return (
        Number(value) +
        Math.random() * Number(errorBand) -
        Math.random() * Number(errorBand)
      );
    });
    return {
      start: xMin,
      end: xMax,
      cut: dateToPlotlyTimestamp(cutDate),
      traceData: {
        normal: { xAll: xTrace, yAll: yTrace },
        forecast: { xAll: xForecast, yAll: yForecast },
        upperError: { xAll: xForecast, yAll: yErrHi },
        lowerError: { xAll: xForecast, yAll: yErrLo },
      },
    };
  }
  return undefined;
};

const createForecastGraphTraces = traceData => {
  const props = forecastTraceProperties();
  let traces = {};
  Object.keys(traceData).map(trace => {
    const traceProps = props[trace];
    let model = emptyTrace(traceProps.name, traceProps.type);
    model = Object.assign(model, traceProps);
    model = Object.assign(model, traceData[trace]);
    model.x = model.xAll;
    model.y = model.yAll;
    traces[trace] = model;
  });
  return traces;
};

export const emptyGraph = {
  traces: {},
  layout: standardLayout,
};

export const emptyTrace = (name, type) => ({
  name: name,
  xAll: [],
  yAll: [],
  x: [],
  y: [],
  type: type,
  mode: 'lines',
});

export const jsonToTraces = jsonData => {
  let newData = [];
  if (jsonData.length > 0) {
    newData = jsonData.map(entry => {
      if (entry.length > 0) {
        return entry.map(e => {
          return {
            x: influxToPlotyTimestamp(e['_time']),
            y: e['_value'],
            name: e['location'],
          };
        });
      }
    });
  }
  return newData;
};
