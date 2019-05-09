$(document).ready(function() {
    controller.init();
});

var controller = function () {
    var DOMStrings, DOMButtons;

    DOMStrings = {
        pluginEnabled: 'select#select_enabled',
        pluginDisabled: 'select#select_disabled'
    };

    DOMButtons = {
        enablePlugin: 'button#enable',
        disablePlugin: 'button#disable'
    };


    var $toggle = $('li#toggle');
    var $upload = $('li#upload');
    $($toggle).addClass('active');
    $('div#plugins_toggle').show();
    $('div#plugins_upload').hide();

    var pluginEventListeners = function () {
        //Event handlers for the plugin disable and enable tab
        //Event Listener when plugin is enabled
        $(DOMButtons.enablePlugin).on('click', function () {
            var plugin = $(DOMStrings.pluginDisabled)


        })

        //Event Listener when plugin is enabled
        $(DOMButtons.disablePlugin).on('click', function () {
            var plugin = $(DOMStrings.pluginEnabled)


        })
    };

    return {
        getDOMStrings: function () {
            return DOMStrings;
        },
        init: function () {
            UIController.init();

            dataController.get('/_enable_plugin', function (data) {
                var $plantselect = $(DOMStrings.plant);
                UIController.updateSelect($plantselect, data.plants)
            });
        }
    }
};


var dataController = ( function () {
    var DOMStrings;
    DOMStrings = controller.getDOMStrings();

    return {
        get: function (url, callback) {
            var data;
            data = {
                pluginEnabled: $(DOMStrings.pluginEnabled).val(),
                pluginDisabled: $(DOMStrings.pluginDisabled).val()
            };
            $.getJSON(url, data, callback);
            
        }
    }
});

var UIController = (function () {
    var DOMStrings = controller.getDOMStrings();

        var updateSelect = function (selector, data) {
            selector.empty();
            $.each(data, function (value, key) {
                selector.append($("<option class='active-result'></option>")
                    .attr("value", value).text(key))
            });
            selector.trigger('chosen:updated');
        };
});

    // var $disabled_select = $('select#select_disabled').children('option');
    // var $enabled_select = $('select#select_enabled').children('option');
    //
    // var $enable_button = $('input#enable');
    // var $disable_button = $('input#disable');

    // if ($disabled_select.html() == 'All plugins enabled'){
    //     $($disabled_select.parent()).attr('disabled', true);
    //     $($enable_button).attr('disabled', true);
    // }
    //
    // else if ($enabled_select.html() == 'No active plugins'){
    //     $($enabled_select.parent()).attr('disabled', true);
    //     $($disable_button).attr('disabled', true);
    // }
    //

    //This contains the info needed to upload the plants

    // $toggle.on('click', function(){
    //     $toggle.addClass('active');
    //     $upload.removeClass('active');
    //     $('div#plugins_toggle').show();
    //     $('div#plugins_upload').hide();
    //
    // });
    //
    // $upload.on('click', function(){
    //     $upload.addClass('active');
    //     $toggle.removeClass('active');
    //     $('div#plugins_toggle').hide();
    //     $('div#plugins_upload').show();
    // })
    // });

    // $(function() {
    //   $('input#enable').on('click', function() {
    //     $.getJSON('/_enable_plugin', {
    //       enableplugins: $('select[id="select_disabled"]').val()
    //     }, function(data) {
    //         $.notify('Plugin enabled', 'success',
    //             {position: 'top-center'})
    //     });
    //     return false;
    //   });
    // });
    //
    // $(function() {
    //   $('input#disable').on('click', function() {
    //     $.getJSON('/_disable_plugin', {
    //       disableplugins: $('select[id="select_enabled"]').val()
    //     }, function(data) {
    //     });
    //     return false;
    //   });
    // });
    //
    // $(function() {
    //   $('input#plugin_submit').on('click', function() {
    //     event.preventDefault();
    //       event.stopPropagation();
    //
    //     var formdata = new FormData($('#uploadplugin')[0]);
    //
    //
    //     $.ajax({
    //         url: '/_uploadp',
    //         type: 'POST',
    //         processData: false,
    //         contentType:false,
    //         data: formdata,
    //         dataType: 'json',
    //         success: function(data) {
    //             if (data.success == true){
    //                 $.notify.defaults({className:'success'})
    //                 $.notify(data.msg,{
    //                     position: 'top center'
    //                 });
    //
    //             } else if (data.success == false) {
    //                 $.notify.defaults({className:'error'})
    //                 $.notify(data.msg, {
    //                     position: 'top center'
    //                 });
    //
    //             }
    //         }
    //     })
    //   });
    // });
