$(document).ready(function () {
    var $multiplot = $('input#multiplot');
    var $setdata = $('div#setdata');


    $multiplot.on('click', function () {

        var multiplot = document.getElementById('multiplot').checked;
        if (multiplot == true){
            $setdata.show()
        } else{
            $setdata.hide()
        }
    })

});

$(function() {
    var xset = '';
    var yset = '';
    var sets = [];
    var $datasets = $('select#datasets');
    var $plotxaxis = $('select#plotxaxis');
    var $plotyaxis = $('select#plotyaxis');



    $('input#setdatabtn').on('click', function () {
        var multiplot = document.getElementById('multiplot').checked;
        var xaxis = $plotxaxis.val();
        var yaxis = $plotyaxis.val();


        $('button#cleardataset').attr('disabled', false);
        $('button#deletedataset').attr('disabled', false);

        if (multiplot == true){
            xset += (xaxis +' ');
            yset += (yaxis + ' ');
            sets.push([xaxis, yaxis]);

        } else {
            xset = $plotxaxis.val();
            yset = $plotyaxis.val();
        }

        var optionsAsString = "";


        for(var i = 0; i < sets.length; i++) {
            optionsAsString += "<option value='" + sets[i] + "'>" + sets[i] + "</option>";
        }
        $datasets.empty().append(optionsAsString).attr('disabled', false);

    });

    $('button#cleardataset').on('click', function () {
        $datasets.empty().append("<option></option>").attr('disabled', true);
        $(this).attr('disabled', true);
        $('button#deletedataset').attr('disabled', true);
        xset = '';
        yset = '';
        sets = [];
    });

    $('button#deletedataset').on('click', function () {
        var $selectedset = $('select#datasets :selected');
        var xsetarr = xset.toString().split(' ');
        var ysetarr = yset.split(' ');
        var removeindex = [];

        $('select#datasets').children().each(function (index) {
            if ($(this).prop('selected') == true){
                removeindex.push(index);

            }


        });

        xsetarr.splice(removeindex, removeindex.length);
        ysetarr.splice(removeindex, removeindex.length);
        sets.splice(removeindex, removeindex.length);
        removeindex = [];

        xset = xsetarr.toString();
        yset = ysetarr.toString();
        $selectedset.remove();

    });


    $('input#Submit').on('click', function() {
        if (document.getElementById('multiplot').checked == false){
            xset = $('select#plotxaxis').val();
            yset = $('select#plotyaxis').val();


        }

        $.getJSON('/_plotdata', {
          plotdata: $('select[name="select"]').val(),
            type: $('select#plotType').val(),
            xset: xset,
            yset: yset
        }, function(data) {
            var $plotarea = $('#plotarea');
            $plotarea.empty();
            $plotarea.append('<hr><br>');
            $plotarea.append(mpld3.draw_figure('plotarea', data.plot));
            if ($('#multiplot').prop('checked') == false){
                xset = '';
                yset = '';
            }

        });
        return false;
        });
    });

$(function () {
    var $plotfile = $('select#plotfile');

    $plotfile.on('change', function(){
        $.getJSON('/_plotdetails', {
            plotfile: $(this).val()},
            function(data){
                var headers = data.headers;
                var optionsAsString = "";
                for(var i = 0; i < headers.length; i++) {
                    optionsAsString += "<option value='" + headers[i] + "'>" + headers[i] + "</option>";
                }
                $( 'select#plotxaxis' ).empty().append(optionsAsString);
                $('select#plotyaxis').empty().append(optionsAsString);

            })
        })
    });

$(function () {

});



$(function () {
    $('button#deleteplot').on('click', function(){
        console.log(true);
        $('#plotarea').empty()
    })
});


