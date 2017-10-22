$(document).ready(function () {
    controller.init();
});

var controller = (function () {
    var DOMStrings, DOMButtons;

    DOMStrings = {
        plant: 'select#plant_select',
        plantDataManage: 'select#plant_select.datamanage',
        plantName: 'input#plant_name',
        tags: 'select#tags',
        tagsDataManage: 'select#tags.datamanage',
        units: 'select#unit_select',
        unitTags: 'select#unit_tags',
        unitName: 'input#unit_name',
        unitDataManage: 'select#unit_select_datamanage',
        unitTagsDataManage: 'select#unit_tags.datamanage',
        dataOpenTab: 'li#open',
        dataSetupTab: 'li#setup',
        dataManageTab: 'li#manage',
        dataOpenView: 'div#dataopen',
        dataSetupView: 'div#plant_setup',
        dataManageView: 'div#datamanage',
        tagsmeta: 'select#tagsmeta',
        tagslower: 'input#taglowerbound',
        tagsupper: 'input#tagupperbound',
        tagsunits: 'input#tagunits'
    };

    DOMButtons = {
        updatePlantName: 'input#updateplantname',
        addUnit: 'input#addunit',
        updateUnitName: 'input#updateunit',
        assignTags: 'input#settags',
        removeTags: 'input#removetags',
        deletePlant: 'input#deleteplant',
        deleteUnit: 'input#deleteunit',
        deleteUnitTags: 'input#deleteunittags',
        deleteTags: 'input#deletetags',
        openFile: 'input#open_file',
        uploadFile: 'input#upload_file',
        tagmetasubmit: 'input#submitmeta'
    };

    // Setting up EventListeners
    var setupEventListners = function () {
        // Event handlers for plant setup tab
        // Event listener for when a plant name is changed
        $(DOMButtons.updatePlantName).on('click', function () {
            dataController.get('/_plantnamechange', function (data) {
                var $plantselect = $(DOMStrings.plant);
                UIController.updateSelect($plantselect, data.plants);
            });
        });
        // Event listener for when a selected plant is changed
        $(DOMStrings.plant).on('change', function () {
            dataController.get('/_plantchangesetup', UIController.updatePlantSetup);
            $(this).trigger('chosen:updated');
        });
        // Event listener for adding a unit
        $(DOMButtons.addUnit).on('click', function () {
            dataController.get('/_unitadd', UIController.updatePlantSetup);
            $(this).trigger('chosen:updated')
        });
        // Event listener form updating a unit's name
        $(DOMButtons.updateUnitName).on('click', function () {
            dataController.get('/_unitnamechange', UIController.updatePlantSetup);

        });
        // Event listener for selecting units in plant setup view
        $(DOMStrings.units).on('change', function () {
            dataController.get('/_unitchange', function (data) {
                var $unittags = $(DOMStrings.unitTags);
                UIController.updateSelect($unittags, data.unittags);
                $(this).trigger('chosen:updated');
            });
        });
        // Event listener for assigning tags to units
        $(DOMButtons.assignTags).on('click', function () {
            dataController.get('/_settags', function (data) {
                var $unittags = $(DOMStrings.unitTags);
                var $freetags = $(DOMStrings.tags);
                UIController.updateSelect($unittags, data.unittags);
                UIController.updateSelect($freetags, data.freetags);

            });
            $(this).trigger('chosen:updated')
        });
        // Event listener for removing tags from units
        $(DOMButtons.removeTags).on('click', function () {
            dataController.get('/_removeunittags', function (data) {
                var $unittags = $(DOMStrings.unitTags);
                var $freetags = $(DOMStrings.tags);
                UIController.updateSelect($unittags, data.unittags);
                UIController.updateSelect($freetags, data.freetags);
            })
        });
        // Event listeners for data management
        //Event listener for changing a plant
        $(DOMStrings.plantDataManage).on('change', function () {
            dataController.get('/_plantchangemanage', UIController.updateDataManagement)
        });
        // Event listener for selecting units in data management view
        $(DOMStrings.unitDataManage).on('change', function () {
            dataController.get('/_unitchangedatamanage', function (data) {
                var $unittags = $(DOMStrings.unitTagsDataManage);
                UIController.updateSelect($unittags, data.unittags);
                $(this).trigger('chosen:updated');
            })
        });
        // Event listener for deleting a plant
        $(DOMButtons.deletePlant).on('click', function () {
            dataController.get('/_deleteplant', function (data) {
                var $plantselect = $(DOMStrings.plant);
                UIController.updateSelect($plantselect, data.plants);
                $(DOMStrings.plantDataManage).trigger('change');
            })
        });
        // Event listener for deleting unit data
        $(DOMButtons.deleteUnit).on('click', function () {
            dataController.get('/_deleteunit', function (data) {
                var $unitselect = $(DOMStrings.unit);
                UIController.updateSelect($unitselect, data.units);
                $(DOMStrings.plant).trigger('change');
            })
        });
        // Event listener for deleting unit tags data
        $(DOMButtons.deleteUnitTags).on('click', function () {
            dataController.get('/_deleteunittags', function (data) {
                var $unitTagsDataManage = $(DOMStrings.unitTagsDataManage);
                UIController.updateSelect($unitTagsDataManage, data.data)
            })
        });
        // Event listener for deleting unassigned tags
        $(DOMButtons.deleteTags).on('click', function () {
            dataController.get('/_deletetags', function (data) {
                var $tagsDataManage = $(DOMStrings.tagsDataManage);
                UIController.updateSelect($tagsDataManage, data.data)
            })
        });
        // Event listener for opening a file
        $(DOMButtons.openFile).on('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            var formdata = new FormData($('#datafile')[0]);
            dataController.postForm('/_dataopen', formdata, 'File uploaded and ready to use')
        });
        // Event listener for uploading file
        $(DOMButtons.uploadFile).on('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            var formdata = new FormData($('#datafile')[0]);
            dataController.postForm('/_dataupload', formdata, 'File uploaded to Evert');
        });
        // Event listeners for UI interfacing
        //Event listener for open tab
        $(DOMStrings.dataOpenTab).on('click', function () {
            $(this).addClass('active');
            $(DOMStrings.dataManageTab).removeClass('active');
            $(DOMStrings.dataSetupTab).removeClass('active');
            $(DOMStrings.dataOpenView).show();
            $(DOMStrings.dataManageView).hide();
            $(DOMStrings.dataSetupView).hide();

        });
        // Event listener for plant setup tab
        $(DOMStrings.dataSetupTab).on('click', function () {
            $(this).addClass('active');
            $(DOMStrings.dataManageTab).removeClass('active');
            $(DOMStrings.dataOpenTab).removeClass('active');
            $(DOMStrings.dataOpenView).hide();
            $(DOMStrings.dataManageView).hide();
            $(DOMStrings.dataSetupView).show();

            dataController.get('/_plantchangesetup', UIController.updatePlantSetup);
        });
        // Event listener for data management tab
        $(DOMStrings.dataManageTab).on('click', function () {
            $(this).addClass('active');
            $(DOMStrings.dataOpenTab).removeClass('active');
            $(DOMStrings.dataSetupTab).removeClass('active');
            $(DOMStrings.dataOpenView).hide();
            $(DOMStrings.dataManageView).show();
            $(DOMStrings.dataSetupView).hide();

            dataController.get('/_plantchangemanage', UIController.updateDataManagement);
        })
        // Event listener for updating meta data
        $(DOMButtons.tagmetasubmit).on('click', function(){

            if ($(DOMStrings.tagsupper).val() && $(DOMStrings.tagslower).val()){
                if ($(DOMStrings.tagsupper).val() > $(DOMStrings.tagslower).val()){
                    dataController.get('/_updatemetadata', function(data){
                        if (data.success) {
                            alertify.success('Meta data updated');
                        } else if (!data.success) {
                            alertify.error('Meta data could not be updated');
                        }
                    })
                } else {
                    alertify.error('Tag lower bound must be smaller than upper bound.');
                }
            } else {
                console.log($(DOMStrings.tagsupper).val(), $(DOMStrings.tagsupper).val(), $(DOMStrings.tagsupper).val())
                dataController.get('/_updatemetadata', function(data){
                        if (data.success) {
                            alertify.success('Meta data updated');
                        } else if (!data.success) {
                            alertify.error('Meta data could not be updated');
                        }
                    })
            }

        });

        // Event listner for selecting tags for metadata update
        $(DOMStrings.tagsmeta).on('change', function(){
            if ($(this).val()){
                if ($(this).val().length === 1) {
                dataController.get('/_gettagmeta', function(data){
                    console.log(data.data)
                    var tagmeta = data.data[0];
                    $(DOMStrings.tagslower).val(tagmeta.lower);
                    $(DOMStrings.tagsupper).val(tagmeta.upper);
                    $(DOMStrings.tagsunits).val(tagmeta.units);
                })
                } else if($(this).val().length > 1){
                    $(DOMStrings.tagslower).val(null);
                    $(DOMStrings.tagsupper).val(null);
                    $(DOMStrings.tagsunits).val(null);
                }
            } else {
                $(DOMStrings.tagslower).val(null);
                $(DOMStrings.tagsupper).val(null);
                $(DOMStrings.tagsunits).val(null);
            }

        })
    };

    return {
        getDOMStrings: function () {
            return DOMStrings;
        },
        init: function () {
            UIController.init();
            dataController.get('/_plantupload', function (data) {
                var $plantselect = $(DOMStrings.plant);
                UIController.updateSelect($plantselect, data.plants)
            });
            setupEventListners();
        }
    }
})();

var dataController = (function () {
    var DOMStrings;
    DOMStrings = controller.getDOMStrings();

    return {
        get: function (url, callback) {
            var data;
            data = {
                plant: $(DOMStrings.plant).val(),
                plantDataManage: $(DOMStrings.plantDataManage).val(),
                plantName: $(DOMStrings.plantName).val(),
                unitName: $(DOMStrings.unitName).val(),
                units: $(DOMStrings.units).val(),
                tags: $(DOMStrings.tags).val(),
                tagsDataManage: $(DOMStrings.tagsDataManage).val(),
                unitTags: $(DOMStrings.unitTags).val(),
                unitDataManage:$(DOMStrings.unitDataManage).val(),
                unitTagsDataManage: $(DOMStrings.unitTagsDataManage).val(),
                tagsmeta: $(DOMStrings.tagsmeta).val(),
                taglower: $(DOMStrings.tagslower).val(),
                tagupper: $(DOMStrings.tagsupper).val(),
                tagunits: $(DOMStrings.tagsunits).val()
            };
            $.getJSON(url, data, callback);
        },
        postForm: function (url, formData, successMessage) {
            $.ajax({
            url: url,
            type: 'POST',
            processData: false,
            contentType: false,
            data: formData,
            dataType: 'json',
            success: function(data) {
                    $.getJSON('/_plantupload',{}, function (data) {
                        var $plantselect = $(DOMStrings.plant);
                        UIController.updateSelect($plantselect, data.plants);
                    });
                    if (data.success){
                        alertify.success('File ready to be used')
                    } else {
                        alertify.error('File upload failed');
                    }

                }
            });
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
            $(DOMStrings.plant).chosen({width: '100%'});
            $(DOMStrings.tags).chosen({width: '100%'});
            $(DOMStrings.units).chosen({width: '100%', max_selected_options:1});
            $(DOMStrings.unitTags).chosen({width: '100%'});
            $(DOMStrings.unitDataManage).chosen({width: '100%'});
            $(DOMStrings.tagsmeta).chosen({width: '100%'});
        },
        updateSelect: function (selector, data) {
            updateSelect(selector, data)

        },
        updatePlantSetup: function (data) {

            var $unitselect = $(DOMStrings.units);
            var $plantname = $(DOMStrings.plantName);
            var $tags = $(DOMStrings.tags);
            var $unitTags = $(DOMStrings.unitTags);
            var $metaTags = $(DOMStrings.tagsmeta);

            try {
                $plantname.val(data.plant_name[1]);
            } catch(err) {
                $plantname.val('');
            }
            // updating the unit select field
           updateSelect($unitselect, data.sections);
            // reselecting users selected plant
            $(DOMStrings.units + " option")
            .each(function() { this.selected = (this.text == data.cursection); });
            //updating the tags select field
            updateSelect($tags, data.tags);
            // clearing unit tags field
            updateSelect($unitTags, null);
            // updating meta tag select
            updateSelect($metaTags, data.alltags);

            $(DOMStrings.plant).trigger('chosen:updated');
            $(DOMStrings.tags).trigger('chosen:updated');
            $(DOMStrings.units).trigger('chosen:updated');
            $(DOMStrings.unitTags).trigger('chosen:updated');
            $(DOMStrings.unitDataManage).trigger('chosen:updated')
        },
        updateDataManagement: function (data) {

            var $unitselect = $(DOMStrings.unitDataManage);
            var $tags = $(DOMStrings.tagsDataManage);
            var $unitTags = $(DOMStrings.unitTagsDataManage);

            // updating the unit select field
           updateSelect($unitselect, data.sections);
            // reselecting users selected plant
            $(DOMStrings.unitDataManage + " option")
            .each(function() { this.selected = (this.text == data.cursection); });
            //updating the tags select field
            updateSelect($tags, data.alltags);
            // clearing unit tags field
            updateSelect($unitTags, null);

            $(DOMStrings.plant).trigger('chosen:updated');
            $(DOMStrings.tagsDataManage).trigger('chosen:updated');
            $(DOMStrings.unitDataManage).trigger('chosen:updated');
            $(DOMStrings.unitTagsDataManage).trigger('chosen:updated');
        }
    }
})();
