'use strict';
$(function () {
  $('#user').on('keyup', function (event) {
    if (event.keyCode == 13) {
      $('#add').click();
    }
  });

  $('#add').on('click', function () {
    $.ajax('/users', {
      method: 'PUT',
      data: {
        user: $('#user').val(),
      },
      context: $('#user').parents('.form-group'),
    }).then(function () {
      $('#user').val('');
      $(this).removeClass('has-error');
      $('#container').load(location.href + ' #content');
    }, function (err) {
      $(this).addClass('has-error');
      console.log(err);
    });
  });

  $('#container').on('click', '.bet', function () {
    var amount = $(this).val();
    var user = $(this).parents('.user').find('h2').text();
    $.ajax('/bet', {
      method: 'POST',
      data: {
        user: user,
        amount: amount,
      },
    }).then(function () {
      $('#container').load(location.href + ' #content');
    }, function (err) {
      console.log(err);
    });
  });

  $('#container').on('click', '.win', function () {
    var user = $(this).parents('.user').find('h2').text();
    $.ajax('/win', {
      method: 'POST',
      data: {
        user: user,
      },
    }).then(function () {
      $('#container').load(location.href + ' #content');
    }, function (err) {
      console.log(err);
    });
  });

  //setInterval(function () {
  //  $('#container').load(location.href + ' #content');
  //}, 500);
});
