function update_select(selector, data){
    selector.empty();
    $.each(data, function (value, key) {
                selector.append($("<option class='active-result'></option>")
                    .attr("value", value).text(key))
    });

    selector.trigger('chosen:updated');
}

function plant_setup(data) {
            var $unitselect = $('select#unit_select');
            var $plantname = $('input#plant_name');
            var $tags = $('select#tags');

            try{
                $plantname.val(data.plant_name[1]);
            } catch(err) {
                $plantname.val('');
            }


            // updating the unit select field
            update_select($unitselect, data.sections);

            // reselecting users selected plant
            $("select#unit_select option")
            .each(function() { this.selected = (this.text == data.cursection); });

            //updating the tags select field
            update_select($tags, data.tags);


            $('select#plant_select').trigger('chosen:updated');
            $('select#tags').trigger('chosen:updated');
            $('select#unit_select').trigger('chosen:updated');
            $('select#unit_tags').trigger('chosen:updated');
        }


$(document).ready(function () {
    var $plantsetuptab = $('li#setup');
    var $opentab = $('li#open');
    var $datamanagetab = $('li#manage');


    $('select#plant_select').chosen({width: '100%'});
    $('select#tags').chosen({width: '100%'});
    $('select#unit_select').chosen({width: '100%'});
    $('select#unit_tags').chosen({width: '100%'});

    $.getJSON('/_plantupload',{

                }, function (data) {
                    var $plantselect = $('select#plant_select');
                    update_select($plantselect, data.plants)
                });



    $opentab.on('click', function () {
        $(this).addClass('active');
        $plantsetuptab.removeClass('active');
        $datamanagetab.removeClass('active');


        $('div#dataopen').show();
        $('div#plant_setup').hide();
        $('div#datamanage').hide();

    });



    $plantsetuptab.on('click', function () {
        $(this).addClass('active');
        $opentab.removeClass('active');
        $datamanagetab.removeClass('active');

        $('div#dataopen').hide();
        $('div#plant_setup').show();
        $('div#datamanage').hide();




        $.getJSON('/_plantchange',{
            plant: $('select#plant_select').val()
        }, plant_setup);

        $(this).trigger('chosen:updated');
    });

    $datamanagetab.on('click', function () {
        $(this).addClass('active');
        $opentab.removeClass('active');
        $plantsetuptab.removeClass('active');


        $('div#dataopen').hide();
        $('div#plant_setup').hide();
        $('div#datamanage').show();

        $.getJSON('/_plantchange',{
            plant: $('select#plant_select').val()
        }, plant_setup);

        $(this).trigger('chosen:updated');

    })
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
                $.getJSON('/_plantupload',{

                }, function (data) {
                    var $plantselect = $('select#plant_select');
                    update_select($plantselect, data.plants)
                })

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




$(function () {
    $('select#plant_select').on('change', function () {
        var cur_plant = $(this).val();

        $.getJSON('/_plantchange', {
            plant: cur_plant
        }, plant_setup);
        $(this).trigger('chosen:updated');
    });


    $('input#updateplantname').on('click', function(){
        $.getJSON('/_plantnamechange',{
            newname: $('input#plant_name').val(),
            plant: $('select#plant_select :selected').val()
        }, function (data) {
            var $plantselect = $('select#plant_select');
            update_select($plantselect, data.plants)
        });
    });


    $('input#addunit').on('click', function () {
        $.getJSON('/_unitadd',{
            plant: $('select#plant_select :selected').val(),
            unit: $('select#unit_select :selected').val(),
            unitname: $('input#unit_name').val()
        }, plant_setup);

        $(this).trigger('chosen:updated')
    });

    $('input#updateunit').on('click', function () {
        $.getJSON('/_unitnamechange',{
            plant: $('select#plant_select :selected').val(),
            unit: $('select#unit_select :selected').val(),
            unitname: $('input#unit_name').val()
        }, plant_setup);

        $(this).trigger('chosen:updated')
    });

    $('select#unit_select').on('change', function () {
        $.getJSON('/_unitchange',{
            unit: $(this).val(),
            plant: $('select#plant_select :selected').val()
        }, function (data) {
            var $unittags= $('select#unit_tags');
            update_select($unittags, data.unittags)

        })
    });



    $('input#settags').on('click', function () {
        $.getJSON('/_settags',{
            plant: $('select#plant_select :selected').val(),
            unit: $('select#unit_select :selected').val(),
            unitname: $('select#unit_select :selected').text(),
            tags: $('select#tags').val()

        }, function(data){
            var $unittags = $('select#unit_tags');
            var $freetags = $('select#tags');

            update_select($unittags, data.unittags);
            update_select($freetags, data.freetags);
        });

        $(this).trigger('chosen:updated')
    });


    $('input#removetags').on('click', function () {
        $.getJSON('/_removeunittags', {
            plant: $('select#plant_select :selected').val(),
            unit: $('select#unit_select').val(),
            tags: $('select#unit_tags').val()
        }, function(data){
            var $unittags = $('select#unit_tags');
            var $freetags = $('select#tags');

            update_select($unittags, data.unittags);
            update_select($freetags, data.freetags);
        })
    });


    $('input#deleteplant').on('click', function () {
        $.getJSON('/_deleteplant', {
            plant: $('select#plant_select').val()
        },function (data) {
            var $plantselect = $('select#plant_select');
            update_select($plantselect, data.plants);

            $('select#plant_select').trigger('change');

        })

    });

    // TODO: bind methods to multiple jquery selector to make all elements unique
    $('input#deleteunit').on('click', function () {

        $.getJSON('/_deleteunit', {
            unit:$($('select#unit_select')[1]).val()
        },function (data) {
            var $unitselect = $('select#unit_select');
            update_select($unitselect, data.units);

            $('select#plant_select').trigger('change');

        })
    });
});
