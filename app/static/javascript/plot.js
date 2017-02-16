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
			  $('input#Submit').on('click', function() {
				$.getJSON('/_plotdata', {
				  plotdata: $('select[name="select"]').val(),
                    xaxis: $('select#plotxaxis').val(),
                    yaxis: $('select#plotyaxis').val(),
                    type: $('select#plotType').val()
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
    $('button#deleteplot').on('click', function(){
        console.log(true);
        $('#plotarea').empty()
    })
});


