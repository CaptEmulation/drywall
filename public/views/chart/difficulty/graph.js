


define(function (require, exports, moudle) {
  'use strict';

  var Backbone = require('backbone');
  var nv = require('nvd3');



  var DifficultyGraph = exports.DifficultGraph = Backbone.View.extend({

    el: $('#chart'),

    initialize: function (options) {
      this.data = options.data;
      Backbone.View.prototype.initialize.apply(this, arguments);
    },


    render: function () {
      nv.addGraph(function() {
        var chart = nv.models.lineWithFocusChart().width(this.$el.width()).height(this.$el.height());

        // chart.transitionDuration(500);
        chart.xAxis
          .tickFormat(d3.format(',f'));
        chart.x2Axis
          .tickFormat(d3.format(',f'));

        chart.yAxis
          .tickFormat(d3.format(',.2f'));
        chart.y2Axis
          .tickFormat(d3.format(',.2f'));

        d3.select('#chart')
          .datum(this.data)
          .call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
      }.bind(this));

      return this;
    }
  })
});