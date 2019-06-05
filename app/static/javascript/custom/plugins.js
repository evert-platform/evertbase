$(document).ready(function() {
    controller.init();
});

var controller = (function () {
    var DOMStrings, DOMButtons;

    DOMStrings = {
        pluginEnabled:'select#select_enabled' ,
        pluginDisabled: 'select#select_disabled',
        pluginUploadTab: 'li#upload',
        pluginToggleTab: 'li#toggle',
        pluginUploadView: 'div#plugins_upload',
        pluginToggleView: 'div#plugins_toggle'
    };

    DOMButtons = {
        enablePlugin: 'button#enable',
        disablePlugin: 'button#disable'
    };
    //
    // if ($(disabled_select.html()) == 'All plugins enabled'){
    //     $($disabled_select.parent()).attr('disabled', true);
    //     $($enable_button).attr('disabled', true);
    // }
    //
    // else if ($(enabled_select.html()) == 'No active plugins') {
    //     $($enabled_select.parent()).attr('disabled', true);
    //     $($disable_button).attr('disabled', true);
    // }

    function reload_server() {
      // Reload Server
      $.ajax({
        url: "/reload-server/"
      });
      // Wait 1 second and reload page
      setTimeout(function(){
        window.location = document.URL;
      }, 1000);
    }

    var pluginEventListeners = function () {
        //Event handlers for the plugin disable and enable tab
        //Event Listener when plugin is enabled
        $(DOMButtons.enablePlugin).on('click', function () {
            dataController.get('/_enable_plugin', function (data) {
                var $disabledplugin = $(DOMStrings.pluginDisabled);
                var $enabledplugin =  $(DOMStrings.pluginEnabled);
                try {
                    $disabledplugin.val();
                } catch(err) {
                    $disabledplugin.val('');
                }
                UIController.updateSelect($disabledplugin, data.pluginDisabled);
                UIController.updateSelect($enabledplugin, data.pluginEnabled);
                alertify.success('Plugin enabled');
            });
        })

        //Event Listener when plugin is disabled
        $(DOMButtons.disablePlugin).on('click', function () {
            dataController.get('/_disable_plugin',function (data) {
                var $disabledplugin = $(DOMStrings.pluginDisabled);
                var $enabledplugin =  $(DOMStrings.pluginEnabled);
                UIController.updateSelect($disabledplugin, data.pluginDisabled);
                UIController.updateSelect($enabledplugin, data.pluginEnabled);
            });
        })

        //Event listeners for UI interfacing
        //Event listener for Plugin management tab
        $(DOMStrings.pluginToggleTab).on('click',function () {
            $(this).addClass('active');
            $(DOMStrings.pluginUploadTab).removeClass('active');
            $(DOMStrings.pluginToggleView).show();
            $(DOMStrings.pluginUploadView).hide();
        })

        //Event listener for Plugin Upload Tab
        $(DOMStrings.pluginUploadTab).on('click',function () {
            $(this).addClass('active');
            $(DOMStrings.pluginToggleTab).removeClass('active');
            $(DOMStrings.pluginToggleView).hide();
            $(DOMStrings.pluginUploadView).show();
        })
    };

    return {
        getDOMStrings: function () {
            return DOMStrings;
        },
        init: function () {
            UIController.init();

            dataController.get('/_dataupload')
            pluginEventListeners();

            Dropzone.options.pluginupload = {
                addRemoveLinks: true,
                createImageThumbnails: false,
                 init: function() {
                    this.on('success', function(file, server){
                        if (server.success) {
                            alertify.success(file.name + ' has been uploaded');
                            this.removeFile(file);
                            $.getJSON('/_dataupload',{}, function (data) {
                            var $plugindisabled = $(DOMStrings.pluginDisabled);
                            UIController.updateSelect($plugindisabled, data.pluginDisabled);
                    })
                        } else if (!server.success){
                            alertify.error(file.name + ' could not be uploaded');
                            file.previewElement.classList.add('dz-error');
                        }
                    });

                },
                accept: function(file, done){

                    if (file.name.split('.')[1] === 'csv'){
                        done()
                    } else {
                        done('')
                    }
                }
            }
        }
    }
})();


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
})();

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

    return {
        init: function () {
            $(DOMStrings.pluginEnabled).chosen({width: '100%'});
            $(DOMStrings.pluginDisabled).chosen({width: '100%'});
        },

        updateSelect: function (selector, data) {
            updateSelect(selector, data)
        },

    }

})();

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
