$(document).ready(function () {
    var $uploadtab = $('li#upload');
    var $plantsetuptab = $('li#setup');
    var $opentab = $('li#open');


    $uploadtab.on('click', function () {
        $(this).addClass('active');
        $plantsetuptab.removeClass('active');
        $opentab.removeClass('active');

        $('fieldset#open_file').hide();
        $('fieldset#upload_file').show();
        $('fieldset#plantsetup').hide();


    });

    $plantsetuptab.on('click', function () {
        $(this).addClass('active');
        $uploadtab.removeClass('active');
        $opentab.removeClass('active');

        $('fieldset#open_file').hide();
        $('fieldset#upload_file').hide();
        $('fieldset#plantsetup').show();
    });

    $opentab.on('click', function () {
        $(this).addClass('active');

        $uploadtab.removeClass('active');
        $plantsetuptab.removeClass('active');

        $('fieldset#open_file').show();
        $('fieldset#upload_file').hide();
        $('fieldset#plantsetup').hide();
    })

});
