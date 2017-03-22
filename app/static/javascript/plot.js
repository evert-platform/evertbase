$(document).ready(function () {
    $('select#plotPlant').chosen({width: '100%'});
    $('select#plotUnits').chosen({width: '100%'});
    $('select#plotTags').chosen({width: '100%'});
    $('select#plotType').chosen({width: '100%'});

});

function update_select(selector, data){
    selector.empty();
    $.each(data, function (value, key) {
                selector.append($("<option class='active-result'></option>")
                    .attr("value", value).text(key))
    });
    selector.trigger('chosen:updated');
}


function plant_setup(data) {
            var $unitselect = $('select#plotUnits');
            var $plant = $('select#plotPlant');
            var $tags = $('select#plotTags');

            console.log(true);
            console.log(data);

            // updating the unit select field
            update_select($unitselect, data.sections);


            //updating the tags select field
            update_select($tags, data.alltags);

            $unitselect.trigger('chosen:updated');
            $tags.trigger('chosen:updated');


        }


// function for deleting current plot element (might be removed when switching to bokeh)
$(function () {
    $('select#plotPlant').on('change', function () {
        $.getJSON('/_plantchange', {
            plant: $('select#plotPlant').val()
        }, plant_setup)
    });

    $('select#plotUnits').on('change', function () {
        $.getJSON('/_unitchange', {
            plant: $('select#plotPlant').val(),
            unit: $('select#plotUnits').val()
        }, function(data){
            var $plotTags = $('select#plotTags');

            update_select($plotTags, data.unittags)
        })

    });
    
    $('input#Submit').on('click', function () {
        $.getJSON('/_plotdata', {
            tags: $('select#plotTags').val(),
            type: $('select#plotType').val(),
        }, function (data) {
            var $plotarea = $('#plotarea');
            $plotarea.empty();
            $plotarea.append('<hr><br>');
            $plotarea.append(mpld3.draw_figure('plotarea', data.plot));
        })
    });
    

    $('button#deleteplot').on('click', function(){
        $('#plotarea').empty()

    })
});






