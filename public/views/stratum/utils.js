/**
 * Created by jdean on 3/24/14.
 */
define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');

  exports.confirmDangerousAction = function (button, action) {
    var really;

    var functor = function (reset) {
      if (really) {
        action();
      } else {
        really = true;
        button.addClass('btn-danger');
      }
    };
    functor.reset = function () {
      really = false;
    }
    return functor;
  };


});