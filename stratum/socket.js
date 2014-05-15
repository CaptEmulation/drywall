/**
 * Created by jdean on 4/13/14.
 */


exports.create = function (socket) {

  var self = {
    write: function (data) {
      if (data.charAt(data.length - 1) !== '\n') {
        socket.write(data + '\n');
      } else {
        socket.write(data);
      }
    },
    on: function () {
      socket.on.apply(this, arguments);
    },
    off: function () {
      socket.off.apply(this, arguments);
    },
    end: function () {
      socket.end.apply(this, arguments);
    }
  };

  return self;
};