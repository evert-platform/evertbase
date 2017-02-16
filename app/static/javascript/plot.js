$(document).ready(function () {
    var $multiplot = $('input#multiplot');
    var $setdata = $('div#setdata');


    $multiplot.on('click', function () {
        // $(this).toggle(this.checked)
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


    $('input#Submit').on('click', function() {
        $.getJSON('/_plotdata', {
          plotdata: $('select[name="select"]').val(),
            xaxis: $('select#plotxaxis').val(),
            yaxis: $('select#plotyaxis').val(),
            type: $('select#plotType').val(),
           xset: xset,
            yset: yset
        }, function(data) {
            var $plotarea = $('#plotarea');
            $plotarea.empty();
            $plotarea.append('<hr><br>');
            $plotarea.append(data.plot);
        });
        return false;
        });
    });

$(function () {
    $('select#plotfile').on('change', function(){
        $.getJSON('/_plotdetails', {
            plotfile: $('select#plotfile').val()},
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


