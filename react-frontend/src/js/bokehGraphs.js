const bokeh = window.Bokeh;
const plt = bokeh.Plotting;

export const bokehPlot = () => {
  // create some data and a ColumnDataSource
  var x = [];
  var y1 = [];
  var y2 = [];
  var source = new bokeh.ColumnDataSource({
    data: { x: x, coyote_creek: y1, santa_monica: y2 },
  });
  var tool = 'xpan,xwheel_zoom,xbox_zoom,reset';
  var p = plt.figure({
    plot_width: 1000,
    plot_height: 420,
    title: 'Bokeh Visualization Test',
    tools: tool,
    y_axis_location: 'left',
    x_axis_type: undefined,
    x_range: new bokeh.DataRange1d({
      follow: 'end',
      follow_interval: 100,
      range_padding: 0,
    }),
    y_range: new bokeh.DataRange1d({
      follow: 'end',
      follow_interval: 100,
      range_padding: 0,
    }),
  });

  var l1 = new bokeh.Line({
    x: { field: 'x' },
    y: { field: 'coyote_creek' },
    line_width: 3,
    line_color: 'blue',
  });
  var l2 = new bokeh.Line({
    x: { field: 'x' },
    y: { field: 'santa_monica' },
    line_width: 3,
    line_color: 'orange',
  });
  p.add_glyph(l1, source);
  p.add_glyph(l2, source);
  return {
    src: source,
    plot: p,
  };
};
