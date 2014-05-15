/**
 * Created by jdean on 2/24/14.
 */

'use strict';

function jadeRendererFromFunc(func) {
  return {
    render: func
  };
}

var ListView = exports.ListView = function (delegate) {
  if (!delegate) {
    throw new Error("Must define a delegate");
  }

  this._delegate = delegate;
};

ListView.prototype.data = function () {
  console.log('building tableView data');
  var data = [], rowCount = this.rowCount();

  // Check for header
  if (typeof this._delegate.htmlForHeader) {
    data.push(jadeRendererFromFunc(this._delegate.htmlForHeader));
  }

  for (var i = 0; i < rowCount; i++) {
    data.push(this._dataForRow(i));
  }

  return data;
};

ListView.prototype._dataForRow = function (rowIndex) {
  if (typeof this._delegate.htmlForIndex === 'function') {
    var delegate = this._delegate;
    return jadeRendererFromFunc(function () {
      return delegate.htmlForIndex({
        row: rowIndex
      });
    });
  } else {
    throw new Error("Must have a delegate with an htmlForIndex method");
  }
};

ListView.prototype.rowCount = function () {
  if (typeof this._delegate.rowCount === 'function') {
    return this._delegate.rowCount();
  } else if (typeof this._delegate.rowCount !== 'undefined') { // check if is num
    return this._delegate.rowCount;
  } else {
    throw new Error("Failed to obtain row count from table view delegate");
  }
};


