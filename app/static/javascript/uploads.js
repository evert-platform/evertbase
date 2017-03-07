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

function update_select(selector, data){
    selector.empty();
    $.each(data, function (value, key) {
                selector.append($("<option></option>")
                    .attr("value", value).text(key))
    });
}


$(function () {
    $('select#plant_select').on('change', function () {
        var cur_plant = $(this).val();

        $.getJSON('/_plantchange', {
            plant: cur_plant
        }, function (data) {
            var $unitselect = $('select#unit_select');
            var $plantname = $('input#plant_name');
            var $unittags = $('select#unit_tags');
            var $tags = $('select#tags');

            $plantname.val(data.plant_name[1]);

            // updating the unit select field
            update_select($unitselect, data.sections);

            // selecting the first element
            var $firstunit = $('select#unit_select :first-child');
            $firstunit.attr('selected', true);

            $('input#unit_name').val($firstunit.text());

            // updating the unit_tags select field
            update_select($unittags, data.unittags);

            //updateing the tags select field
            update_select($tags, data.tags);
        });


    });
});