import { pad } from './helper';
// General NOAA Data Information
export const startNOAAData = new Date(1439856000 * 1000);
export const endNOAAData = new Date(2015, 8, 18, 0, 0, 0);
export const measurementsNOAA = [
  {
    label: 'Average Temparature',
    measurement: 'average_temperature',
    fields: [
      {
        name: 'degrees',
        label: 'Degrees (°F)',
      },
    ],
  },
  {
    label: 'Water Level',
    measurement: 'h2o_feet',
    fields: [
      {
        name: 'level description',
        label: 'Stages / Interval Level',
      },
      {
        name: 'water_level',
        label: 'Feet / Discrete Level',
      },
    ],
  },
  {
    label: 'pH-Measurements',
    measurement: 'h2o_pH',
    fields: [
      {
        name: 'pH',
        label: 'pH-Level (0-14)',
      },
    ],
  },
  {
    label: 'Water Quality',
    measurement: 'h2o_quality',
    fields: [
      {
        name: 'index',
        label: 'Indexed (0-100)',
      },
    ],
  },
  {
    label: 'Water Temperature',
    measurement: 'h2o_temperature',
    fields: [
      {
        name: 'degrees',
        label: 'Degrees (°F)',
      },
    ],
  },
];

// GUI Constants
const dateLabel = date => {
  return (
    pad(date.getDate(), 2) +
    '|' +
    pad(date.getMonth() + 1, 2) +
    '|' +
    pad(date.getFullYear(), 2)
  );
};

export const marksMaxPoints = [
  {
    value: 15,
    label: '15',
  },
  {
    value: 100,
    label: '100',
  },
  {
    value: 300,
    label: '300',
  },
  {
    value: 500,
    label: '500',
  },
];

const offsetWeek = d =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7, d.getHours());
const s = startNOAAData;
const e = endNOAAData;
const m = new Date((s.getTime() + e.getTime()) / 2);
export const marksQueryStart = [
  {
    value: s.getTime() / 1000,
    label: dateLabel(s),
  },
  {
    value: offsetWeek(s) / 1000,
    label: '+1w',
  },
  {
    value: m.getTime() / 1000,
    label: dateLabel(m),
  },
  {
    value: offsetWeek(m) / 1000,
    label: '+3w',
  },
  {
    value: e.getTime() / 1000,
    label: dateLabel(e),
  },
];

export const marksQueryStep = [
  {
    value: 60,
    label: '1m',
  },
  {
    value: 60 * 10,
    label: '10m',
  },
  {
    value: 60 * 30,
    label: '30m',
  },
  {
    value: 60 * 60,
    label: '1h',
  },
];

export const marksQueryInterval = [
  {
    value: 10,
    label: '10s',
  },
  {
    value: 200,
    label: '200ms',
  },
  {
    value: 500,
    label: '500ms',
  },
  {
    value: 1000,
    label: '1s',
  },
];
