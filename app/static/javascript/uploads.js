$(document).ready(function () {
    var $uploadtab = $('li#upload');
    var $plantsetuptab = $('li#setup');
    var $opentab = $('li#open');

    $opentab.on('click', function () {
        $(this).addClass('active');

        $uploadtab.removeClass('active');
        $plantsetuptab.removeClass('active');

        $('fieldset#datafileform').show();
        $('input#open_file').show();
        $('div#uploaddesc').show();
        $('input#upload_file').hide();
        $('fieldset#plantsetup').hide();

    });



    $plantsetuptab.on('click', function () {
        $(this).addClass('active');
        $uploadtab.removeClass('active');
        $opentab.removeClass('active');

        $('input#open_file').hide();
        $('input#upload_file').hide();
        $('fieldset#plantsetup').show();
        $('fieldset#datafileform').hide();
        $('div#uploaddesc').hide();
    });



});


$(function() {


        var $openbtn = $('input#open_file');
        var $uploadbtn = $('input#upload_file');

      $openbtn.on('click', function() {
        event.preventDefault();
        event.stopPropagation();

        var formdata = new FormData($('#datafile')[0]);


        $.ajax({
            url: '/_dataopen',
            type: 'POST',
            processData: false,
            contentType: false,
            data: formdata,
            dataType: 'json',
            success: function(data) {
                }
            });
        });

      $uploadbtn.on('click', function () {

        event.preventDefault();
        event.stopPropagation();

        var formdata = new FormData($('#datafile')[0]);


        $.ajax({
            url: '/_dataupload',
            type: 'POST',
            processData: false,
            contentType: false,
            data: formdata,
            dataType: 'json',
            success: function(data) {
            }
            });

      })

      });
