const standardWidth = 1200;
const standardHeight = 600;

export const emptyGraph = () => ({
  data: [],
  layout: {
    width: standardWidth,
    height: standardHeight,
    title: 'Empty Graph',
    layoutrevision: 0,
  },
});

export const emptyTrace = () => ({
  x: [],
  y: [],
  type: 'scatter',
  mode: 'lines',
});
