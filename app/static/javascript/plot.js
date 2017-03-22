
// function for deleting current plot element (might be removed when switching to bokeh)
$(function () {
    $('button#deleteplot').on('click', function(){
        console.log(true);
        $('#plotarea').empty()
    })
});




