$(document).ready(function () {
    var $uploadtab = $('li#upload');
    var $plantsetuptab = $('li#setup');


    $uploadtab.on('click', function () {
        $(this).addClass('active');
        $plantsetuptab.removeClass('active');

        $('div#upload_file').show();
        $('div#plantsetup').hide();

    });

    $plantsetuptab.on('click', function () {
        $(this).addClass('active');
        $uploadtab.removeClass('active');

        $('div#upload_file').hide();
        $('div#plantsetup').show();
    })

});
