
window.app = window.app || {};

window.app.init = function () {

  require(['jquery', 'underscore', 'bootstrap', 'backbone.validateAll', 'backbone', 'marionette'], function () {
    'use strict';

    var $ = require('jquery');
    require('jqueryui');
    require('bootstrap');
    require('backbone.validateAll');
    var Backbone = require('backbone');
    var Marionette = require('marionette');


    var CoinModel = exports.CoinModel = Backbone.Model.extend({
      id: '_id'
    });

    var CoinCollection = exports.CoinCollection = Backbone.Collection.extend({
      model: CoinModel,
      url: '/sl/coins/'
    });

    var CoinItem = Marionette.ItemView.extend({
      template: '#tmpl-_coin-balance-cell'
    });

    var CoinGrid = Marionette.CollectionView.extend({
      itemView: CoinItem,
      events: {
        'before:item:added' : function () {

        }
      }
    });

    (function() {
      'use strict';

      var loadTable = function () {
        $.ajax('/coins/table').then(function (res) {
          $('.coin-table').html(res);
        }).then(function () {
            $('.btn.delete').click(createDeleteButtonHandler());
            $('.btn.edit').click(createEditButtonHandler());
            $('.btn.add').click((function () {
              var editDialogContainer = $('.modal-content');

              return function () {
                $.ajax('/coins/add/').then(function (res) {
                  editDialogContainer.html(res);
                }).then(function () {
                    var addModal = $('#coin-add-modal');
                    addModal.modal();

                    addModal.find('.btn.add').click(function () {
                      var form = addModal.find('form');
                      var data = {
                        fullName: form.find('input#coin-name').val(),
                        shortName: form.find('input#coin-short-name').val(),
                        host: form.find('input#coin-host').val(),
                        port: form.find('input#coin-port').val(),
                        rpcUser: form.find('input#coin-rpc-user').val(),
                        rpcPassword: form.find('input#coin-rpc-password').val()
                      };
                      console.log('POST on coin with data: ' + JSON.stringify(data, null, 2));
                      $.ajax({
                        url: '/sl/coins/',
                        type: 'POST',
                        dataType: 'json',
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(data)
                      }).then(addModal.modal('hide')).then(function () {
                          loadTable();
                        });
                    });
                  });
              };

            })());
          });

      };

      var createDeleteButtonHandler = function () {
        var modalContainer = $('.modal-content');

        return function() {
          var id = $(this).data('coinId').replace(/"/g, '');
          $.ajax('/coins/' + id + '/delete/').then(function (res) {
            modalContainer.html(res);
          }).then(function () {
              var modal = $('#coin-delete-modal');
              modal.modal();
              modal.find('button.confirm').click(function () {
                console.log('DELETE on coin ' + id);
                $.ajax({
                  url: '/sl/coins/' + id,
                  type: 'DELETE'
                }).then(modal.modal('hide')).then(function () {
                    loadTable();
                  });
              });
              modal.on('hide.bs.modal', function (/*e*/) {
                modal.off('hide.bs.modal');
                modalContainer.empty();
              });
            });
        };
      };

      var createEditButtonHandler = function () {
        var editDialogContainer = $('.modal-content');

        return function() {
          var id = $(this).data('coinId').replace(/"/g, '');
          $.ajax('/coins/' + id + '/edit/').then(function (res) {
            editDialogContainer.html(res);
          }).then(function () {
              var editModal = $('#coin-edit-modal');
              editModal.modal();
              editModal.find('button.confirm').click(function () {
                var form = editModal.find('form');
                var data = {
                  fullName: form.find('input#coin-name').val(),
                  shortName: form.find('input#coin-short-name').val(),
                  host: form.find('input#coin-host').val(),
                  port: form.find('input#coin-port').val(),
                  rpcUser: form.find('input#coin-rpc-user').val(),
                  rpcPassword: form.find('input#coin-rpc-password').val()
                };
                console.log('PUT on coin ' + id + " with data: " + JSON.stringify(data, null, 2));
                $.ajax({
                  url: '/sl/coins/' + id,
                  type: 'PUT',
                  dataType: 'json',
                  contentType: "application/json; charset=utf-8",
                  data: JSON.stringify(data)
                }).then(editModal.modal('hide')).then(function () {
                    loadTable();
                  });
              });
              editModal.on('hide.bs.modal', function (/*e*/) {
                editModal.off('hide.bs.modal');
                editDialogContainer.empty();
              });
            });
        };
      };

      loadTable();


    }());


  });

}

