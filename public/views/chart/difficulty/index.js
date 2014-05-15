


define(function (require, exports, moudle) {
  'use strict';

  var Backbone = require('backbone');
  var nv = require('nvd3');







  var DifficultyGraph = Backbone.View.extend({

    render: function () {
      nv.addGraph(function() {
        var chart = nv.models.lineWithFocusChart();

        // chart.transitionDuration(500);
        chart.xAxis
          .tickFormat(d3.format(',f'));
        chart.x2Axis
          .tickFormat(d3.format(',f'));

        chart.yAxis
          .tickFormat(d3.format(',.2f'));
        chart.y2Axis
          .tickFormat(d3.format(',.2f'));

        d3.select('#chart svg')
          .datum(testData())
          .call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
      });

      return this;
    }
  })
});