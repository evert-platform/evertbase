$(document).ready(function () {
    controller.init();
});

var controller = (function () {
    var DOMStrings;

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
        dataManageView: 'div#datamanage'
    };

    // Setting up EventListeners
    var setupEventListners = function () {
        // Event handlers for plant setup tab
        // Event listener for when a plant name is changed
        $('input#updateplantname').on('click', function () {
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
        $('input#addunit').on('click', function () {
            dataController.get('/_unitadd', UIController.updatePlantSetup);
            $(this).trigger('chosen:updated')
        });
        // Event listener form updating a unit's name
        $('input#updateunit').on('click', function () {
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
        $('input#settags').on('click', function () {
            dataController.get('/_settags', function (data) {
                var $unittags = $(DOMStrings.unitTags);
                var $freetags = $(DOMStrings.tags);
                UIController.updateSelect($unittags, data.unittags);
                UIController.updateSelect($freetags, data.freetags);

            });
            $(this).trigger('chosen:updated')
        });
        // Event listener for removing tags from units
        $('input#removetags').on('click', function () {
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
        $('input#deleteplant').on('click', function () {
            dataController.get('/_deleteplant', function (data) {
                var $plantselect = $(DOMStrings.plant);
                UIController.updateSelect($plantselect, data.plants);
                $(DOMStrings.plantDataManage).trigger('change');
            })
        });
        // Event listener for deleting unit data
        $('input#deleteunit').on('click', function () {
            dataController.get('/_deleteunit', function (data) {
                var $unitselect = $(DOMStrings.unit);
                UIController.updateSelect($unitselect, data.units);
                $(DOMStrings.plant).trigger('change');
            })
        });
        // Event listener for deleting unit tags data
        $('input#deleteunittags').on('click', function () {
            dataController.get('/_deleteunittags', function (data) {
                var $unitTagsDataManage = $(DOMStrings.unitTagsDataManage);
                UIController.updateSelect($unitTagsDataManage, data.data)
            })
        });
        // Event listener for deleting unassigned tags
        $('input#deletetags').on('click', function () {
            dataController.get('/_deletetags', function (data) {
                var $tagsDataManage = $(DOMStrings.tagsDataManage);
                UIController.updateSelect($tagsDataManage, data.data)
            })
        });
        // Event listener for opening a file
        $('input#open_file').on('click', function () {
            event.preventDefault();
            event.stopPropagation();
            var formdata = new FormData($('#datafile')[0]);
            dataController.postForm('/_dataopen', formdata, 'File uploaded and ready to use')
        });
        // Event listener for uploading file
        $('input#upload_file').on('click', function () {
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
                unitTagsDataManage: $(DOMStrings.unitTagsDataManage).val()
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
                        var $plantselect = $('select#plant_select');
                        update_select($plantselect, data.plants);
                        $.notify(successMessage, {
                            position: "top center",
                            className: 'success'
                        })
                    })
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
            $(DOMStrings.units).chosen({width: '100%'});
            $(DOMStrings.unitTags).chosen({width: '100%'});
            $(DOMStrings.unitDataManage).chosen({width: '100%'})
        },
        updateSelect: function (selector, data) {
            updateSelect(selector, data)

        },
        updatePlantSetup: function (data) {
            var $unitselect = $(DOMStrings.units);
            var $plantname = $(DOMStrings.plantName);
            var $tags = $(DOMStrings.tags);
            var $unitTags = $(DOMStrings.unitTags);

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
            updateSelect($tags, data.tags);
            // clearing unit tags field
            updateSelect($unitTags, null);

            $(DOMStrings.plant).trigger('chosen:updated');
            $(DOMStrings.tagsDataManage).trigger('chosen:updated');
            $(DOMStrings.unitDataManage).trigger('chosen:updated');
            $(DOMStrings.unitTagsDataManage).trigger('chosen:updated');
        }
    }
})();
