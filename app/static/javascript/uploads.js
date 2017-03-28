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
    controller.init();


    var $plantsetuptab = $('li#setup');
    var $opentab = $('li#open');
    var $datamanagetab = $('li#manage');




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




        $.getJSON('/_plantchangesetup',{
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

        $.getJSON('/_plantchangesetup',{
            plant: $('select#plant_select').val()
        }, UIController.updatePlantSetup);

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
                    update_select($plantselect, data.plants);
                    $.notify('File opened and ready for use', {
                        position: "top center",
                        className: 'success'
                    })
                })

                }
            });
        });

      $uploadbtn.on('click', function () {

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
                    update_select($plantselect, data.plants);
                    $.notify('File uploaded to Evert', {
                        position: "top center",
                        className: 'success'
                    })
                })

                }
            });

      })
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
        unitDataManage: 'select#unit_select.datamanage',
        unitTagsDataManage: 'select#unit_tags.datamanage'
    };

    // Setting up EventListeners
    var setupEventListners = function () {
        // Event handlers for plant setup tab

        // Event listener for when a plant name is changed
        $('input#updateplantname').on('click', function(){
            dataController.get('/_plantnamechange', function (data) {
                var $plantselect = $(DOMStrings.plant);
                UIController.updateSelect($plantselect, data.plants);
            });
        });
        // Event listener for when a selected plant is changed
        $('select#plant_select').on('change', function () {
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
        // Event listener for selecting units
        $('select#unit_select').on('change', function () {
            dataController.get('/_unitchange', function (data) {
                var $unittags = $(DOMStrings.unitTags);
                UIController.updateSelect($unittags, data.unittags);
                $(this).trigger('chosen:updated');
            })
        });
        // Event listener for assigning tags to units
        $('input#settags').on('click', function () {
        dataController.get('/_settags',function(data){
                var $unittags = $(DOMStrings.unitTags);
                var $freetags = $(DOMStrings.tags);
                UIController.updateSelect($unittags, data.unittags);
                UIController.updateSelect($freetags, data.freetags);

            });
            $(this).trigger('chosen:updated')
        });
        // Event listener for removing tags from units
         $('input#removetags').on('click', function () {
            dataController.get('/_removeunittags', function(data){
                var $unittags = $(DOMStrings.unitTags);
                var $freetags = $(DOMStrings.tags);
                UIController.updateSelect($unittags, data.unittags);
                UIController.updateSelect($freetags, data.freetags);
            })
        });

         // Event listeners for data management
        //Event listener for changing a plant
        $('select#plant_select.datamanage').on('change', function () {
            dataController.get('/_plantchangemanage', UIController.updateDataManagement)
        });

        // Event listener for deleting a plant
        $('input#deleteplant').on('click', function () {
            dataController.get('/_deleteplant',function (data) {
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
                console.log(data)
                var $tagsDataManage = $(DOMStrings.tagsDataManage);
                UIController.updateSelect($tagsDataManage, data.data)
            })
        });

    };

    return {
        getDOMStrings: function () {
            return DOMStrings;
        },
        init: function () {
            UIController.init();
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
            console.log(data)
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
        },
        updateSelect: function (selector, data) {
            updateSelect(selector, data)

        },
        updatePlantSetup: function (data) {
            var $unitselect = $(DOMStrings.units);
            var $plantname = $(DOMStrings.plantName);
            var $tags = $(DOMStrings.tags);

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


            $(DOMStrings.plant).trigger('chosen:updated');
            $(DOMStrings.tags).trigger('chosen:updated');
            $(DOMStrings.units).trigger('chosen:updated');
            $(DOMStrings.unitTags).trigger('chosen:updated');
        },

        updateDataManagement: function (data) {
            console.log(data);
            var $unitselect = $(DOMStrings.unitTagsDataManage);
            var $tags = $(DOMStrings.tagsDataManage);

            // updating the unit select field
           updateSelect($unitselect, data.sections);

            // reselecting users selected plant
            $(DOMStrings.unitDataManage + " option")
            .each(function() { this.selected = (this.text == data.cursection); });

            //updating the tags select field
            updateSelect($tags, data.tags);


            $(DOMStrings.plant).trigger('chosen:updated');
            $(DOMStrings.tagsDataManage).trigger('chosen:updated');
            $(DOMStrings.unitDataManage).trigger('chosen:updated');
            $(DOMStrings.unitTagsDataManage).trigger('chosen:updated');
        }
    }

})();



