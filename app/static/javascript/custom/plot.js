$(document).ready(function () {
    "use strict";
    plotController.init();
    controller.init();


});

// Data controller for plotting page
var dataController = (function () {
    "use strict";
    var data, DOMStrings, plotState;
    // plotState = plotController.getPlotState();

    // jQuery selectors for DOM objects
    DOMStrings = {
        plant: "select#plotPlant",
        units: "select#plotUnits",
        tags: "select#plotTags",
        type: "select#plotType",
        submitBtn: "input#Submit",
        deleteBtn: "button#deleteplot",
        plotArea: "plot",
        plotAddOnsArea: "plotAddOnsArea",
        $plotAddOnsArea: "#plotAddOnsArea",
        subplotsCheck: "input#subplots-check",
        linkXaxesValue: "input#linkXaxesValue",
        linkXaxisCheckbox: "div#linkXcheckbox",
        plotAddOns: "select#AddOnSelect",
        clearpluginsbtn: 'button#clearplugindata',
        showplugindata: "input#showPluginCheckbox",
        loader: '#loaderWrapper',
        showboundsCheckbox: 'input#showDataBounds',
        multipleYCheckbox: 'input#multipleYAxes',
        showlogYaxis: 'input#showlogAxis'
    };

    return {
        // executes the $.getJSON method for asynchronous data handling
        getJSONData: function (route, callback) {
            // required plotting data
            data = {
                plant: $(DOMStrings.plant).val(),
                units: $(DOMStrings.units).val(),
                tags: $(DOMStrings.tags).val(),
                type: $(DOMStrings.type).val(),
                subplotCheck: $(DOMStrings.subplotsCheck).is(":checked"),
                linkXaxes: $(DOMStrings.linkXaxesValue).is(":checked")
            };
            $.getJSON(route, data, callback);
        },
        // return the DOMStrings object
        getDOMStrings: function () {
            return DOMStrings;
        }, timeFormat: function(domain){
            var min = domain[0], max = domain[1];
            var diff = max - min;
            var format;


           if (diff <= 3.6e6){
               format = "%H:%M:%S";
           }else if(diff <= 3.6e6*24 && diff > 3.6e6){
               format = "%H:%M";
           }else if(diff <= 3.6e6*24*30 && diff > 3.6e6*24){
               format = "%d-%b  %H:00";
           }else if(diff <=3.6e6*24*365 && diff > 3.6e6*24*30) {
               format = "%M-%d";
           } else {
               format = "%Y-%m-%d %H:%M";
           }

           return format;
        }
    };
})();
// user interface controller
var UIController = (function () {
    "use strict";
    var DOMStrings;
    // DOM object strings
    DOMStrings = dataController.getDOMStrings();
    // update any select field
    var updateSelect = function (selector, data) {
            selector.empty();
            $.each(data, function (value, key) {
                selector.append($("<option class='active-result'></option>").attr("value", value).text(key));
            });
            selector.trigger("chosen:updated");
        };

    return {
        // initialises the chosen jQuery plugin elements
        init: function () {
            $(DOMStrings.plant).chosen({width: "100%"});
            $(DOMStrings.units).chosen({width: "100%"});
            $(DOMStrings.tags).chosen({width: "100%"});
            $(DOMStrings.type).chosen({width: "100%"});
            $(DOMStrings.plotAddOns).chosen({width: "100%"});

        },
        // setup of all select elements when plant is changed
        plantSetup: function (data) {
            var $unitselect = $(DOMStrings.units);
            var $tags = $(DOMStrings.tags);

            // updating the unit select field
            updateSelect($unitselect, data.sections);

            //updating the tags select field
            updateSelect($tags, data.alltags);

            $unitselect.trigger("chosen:updated");
            $tags.trigger("chosen:updated");
        },

        // update tags select element
        updateTags: function(data) {
            var $plotTags = $(DOMStrings.tags);
            if (data.unittags){
                updateSelect($plotTags, data.unittags);
            } else {
                updateSelect($plotTags, data.alltags);
            }

        }
    };
})();

// controller to handle plotting logic
var plotController = (function() {
    "use strict";
    var DOMStrings, socket, plotStateObject;
    plotStateObject = new EvertPlotState();
    DOMStrings = dataController.getDOMStrings();

    var updatePlot = function(data) {
        // data coming from websocket after zoom.
        var newData = data.data;
        // names of the traces that need to be updated
        var newDataNames = _.map(newData, function(d){return d.name;});
        var plotArea = document.getElementById("plot");
        // current data visible on the plot
        var currentData = plotArea.data;
        // current traces in plot state
        var currentTraces = plotStateObject.traces;


        newDataNames.forEach(function(d, i){
            var index = _.findIndex(currentData, ["name", d]);
            currentData[index].x = newData[i].x;
            currentData[index].y = newData[i].y;

            // updating current traces
            var index2 = _.findIndex(currentTraces, ["name", d]);
            currentTraces[index2].x = newData[i].x;
            currentTraces[index2].y = newData[i].y;

        });
        // updating plotStateObject
        plotStateObject.traces = currentTraces;
        // updating current plot window data
        plotArea.data = currentData;
        // redraw plot
        Plotly.redraw(DOMStrings.plotArea);

        $(DOMStrings.plotAddOns).trigger("change");

    };

    return {
         // rendering of plot data
        createPlot: function (plotData, layout, tags_map) {

            // resetting the plot state
            plotStateObject.resetState();
            plotStateObject.subplots = $(DOMStrings.subplotsCheck).prop("checked");
            plotStateObject.linkedXAxis = $(DOMStrings.linkXaxesValue).prop("checked");
            // resetting the add-on space
            Plotly.purge(DOMStrings.plotAddOnsArea);
            $(DOMStrings.plotAddOns).val("none");

            var axismap = {};
            // adding traces to state
            plotData.forEach(function(d, i) {
                plotStateObject.addTrace(new EvertTrace(d.name, d.x, d.y, d.xaxis, d.yaxis, d.metadata));

                axismap[d.name] = {
                    xaxis: d.xaxis || 'x1',
                    yaxis: d.yaxis || 'y1'
                }
            });
            plotStateObject.axisMap = axismap;
            // capturing data from forms
            plotStateObject.formData = {
                plant: $(DOMStrings.plant).val(),
                units: $(DOMStrings.units).val(),
                tags: $(DOMStrings.tags).val()
            };

            plotStateObject.tagsMap = tags_map;

            if (layout === undefined){
                if ($(DOMStrings.subplotsCheck).is(":checked")){
                    var frac = 1/plotData.length;
                    layout = {
                        showlegend: true
                    };

                    if (!$(DOMStrings.linkXaxesValue).is(":checked")){
                        plotData.forEach(function(d, i){
                            layout["xaxis".concat(i+1)] = {
                                title: i === 0 ? "Timestamp": undefined,
                                showline: true,
                                ticks: "outside",
                                anchor: "y"+(i+1)
                            };
                            layout["yaxis".concat(i+1)]= {
                                showline: true,
                                ticks: "outside",
                                fixedrange: true,
                                title: d.metadata.units ? d.name + ' [ '+ d.metadata.units +' ]': d.name,
                                domain: [frac*i + 0.09 , frac*(i+1)]
                            };
                        });

                    } else {

                        layout["xaxis"] = {
                                title: "Timestamp",
                                showline: true,
                                ticks: "outside"

                            };

                        plotData.forEach(function(d, i) {
                            console.log(d.metadata.units)
                            layout["yaxis".concat(i + 1)]= {
                                showline: true,
                                ticks: "outside",
                                fixedrange: true,
                                title: d.metadata.units ? d.name + ' [ '+ d.metadata.units +' ]': d.name,
                                domain: [frac*i + 0.09 , frac*(i+1)]
                            };
                        });
                    }

                } else if (!$(DOMStrings.subplotsCheck).is(":checked")){
                    layout = {
                        showlegend: true,
                        xaxis : {
                            title: "timestamp",
                            showline: true,
                            ticks: "outside"
                        },
                        yaxis: {
                            showline: true,
                            ticks: "outside",
                            fixedrange: true
                        }
                    };
                }
                plotStateObject.plotLayout = layout;
            }

            Plotly.newPlot(DOMStrings.plotArea, plotData, layout,
                {
                    scrollZoom: true,
                    boxZoom: false,
                    showLink: false,
                    displayLogo: false,
                    showTips: false,
                    modeBarButtonsToRemove: ["autoScale2d", "resetScale2d", "sendDataToCloud"],
                    doubleClick: false
                });


            // Event listener for when plot is zoomed. Must be called after plot is created.
            link_zoom_event(socket, DOMStrings, plotStateObject);
            // Check whether user wants multiple  Y axes
            if (!$(DOMStrings.subplotsCheck).prop('checked')){
                multipleYAxes(DOMStrings, $(DOMStrings.multipleYCheckbox).prop('checked'), this);
            }
            // Check for log Axis checkbox
            logAxis(DOMStrings, plotStateObject, $(DOMStrings.showlogYaxis).prop('checked'));
            // Writing plotstate to browser local storage
            localStorage.setItem("plotState", JSON.stringify(plotStateObject.writeState()));
        },

        uploadFeaturesData: function (data) {
            if ($(DOMStrings.showplugindata).prop("checked")) {
                var featureData = data.data;
                var plotArea = document.getElementById(DOMStrings.plotArea);
                var currentData = plotArea.data;
                var dataCount = $(DOMStrings.tags).val().length;

                if (currentData.length === dataCount){
                    currentData = currentData.concat(featureData);
                    plotArea.data = currentData;
                } else if (currentData.length > dataCount) {
                    var newDataNames = _.map(featureData, function(d){return d.name;});

                    var concatData = [];

                    newDataNames.forEach(function(d, i){
                        var test = _.find(currentData, ['name', d]);
                        if (!test){
                            concatData.push(featureData[i])
                        } else {
                            var index = _.findIndex(currentData, ["name", d]);
                            currentData[index].x = featureData[i].x;
                            currentData[index].y = featureData[i].y;
                        }

                    });
                    currentData = currentData.concat(concatData);
                    plotArea.data = currentData;
                }
                Plotly.redraw(DOMStrings.plotArea, plotArea.data, plotArea.layout);
            }
        },
        // delete plot from plot area
        deletePlot: function() {
        Plotly.purge(DOMStrings.plotArea);
        Plotly.purge(DOMStrings.plotAddOnsArea);
        $(DOMStrings.$plotAddOnsArea).hide();
        $(DOMStrings.plotAddOns).val("none");

        plotStateObject.resetState();
        localStorage.removeItem("plotState");
        },
        init: function () {
            var namespace = "/test";
            socket = io.connect(location.protocol + "//" + document.domain + ":" + location.port + namespace);

            socket.on("connect", function() {
                        console.log("connected");
                    });

            socket.on("pluginFeaturesEmit", function(data){
                plotController.uploadFeaturesData(data);
            });

            socket.on("zoom_return", function(data){
                updatePlot(data);
            });

            socket.on("add_on_return_plot_data", function(data){
                if (!data.msg){
                    var layout = data.layout;
                    layout.showlegend = false;
                    var plotData = data.data;
                    Plotly.newPlot(DOMStrings.plotAddOnsArea, plotData, layout);
                    $(DOMStrings.loader).hide();
                } else if (data.msg) {
                    alertify.error(data.msg);
                    $(DOMStrings.plotArea).val("none");
                    $(DOMStrings.$plotAddOnsArea).hide();
                    $(DOMStrings.loader).hide();
                }
            });
        },
        getPlotState: function(){
            return plotStateObject;
        },
        getSocket: function () {
            return socket;
        }
    };
})();

// general plot page controller
var controller = (function () {
    "use strict";
    var DOMStrings, plotStateObject;

    DOMStrings = dataController.getDOMStrings();
    plotStateObject = plotController.getPlotState();

    // setting up event listeners
    var setupEventListners = function(){
        // Event listener for plot button
        $(DOMStrings.submitBtn).on("click", function () {
            var plottags = $(DOMStrings.tags).val();
            if (plottags !== null){
                dataController.getJSONData("/_plotdata", function(d) {
                    plotController.createPlot(d.data, undefined, d.tags_map);
                });
            } else if (plottags === null){
                alertify.error("Please select one or more tags to plot")
            }
        });

        // Event listener for when units are selected (updates tags)
        $(DOMStrings.units).on("change", function () {
            dataController.getJSONData("/_unitchange", UIController.updateTags);
        });

        // Event listener for when the plant is changed (updates units and tags)
        $(DOMStrings.plant).on("change", function () {
            dataController.getJSONData("/_plantchangesetup", UIController.plantSetup);
        });

        // Event listener for delete button
        $(DOMStrings.deleteBtn).on("click", function(){

           alertify.confirm('Are you sure?', 'Deleting plot deletes all information.',
               function(){
                    plotController.deletePlot();
               },
               function(){}
           );
        });

        // Event listener for subplots check button
        $(DOMStrings.subplotsCheck).on("click", function(){
            if ($(this).is(":checked")){
                $(DOMStrings.linkXaxisCheckbox).show();
                $(DOMStrings.multipleYCheckbox).prop('disabled', true);
                plotStateObject.subplots = true;
            } else {
                $(DOMStrings.linkXaxisCheckbox).hide();
                $(DOMStrings.multipleYCheckbox).prop('disabled', false);
                plotStateObject.subplots = false;
            }
        });

        // Event listener for plot add-ons
        $(DOMStrings.plotAddOns).on("change", function(){
            if ($(DOMStrings.tags).val() !== null){
                if ($(DOMStrings.linkXaxesValue).is(":checked") || !$(DOMStrings.subplotsCheck).is(":checked")){

                $(DOMStrings.$plotAddOnsArea).show();
                $(DOMStrings.loader).show();
                Plotly.purge(DOMStrings.plotAddOnsArea);

                if ($(this).val() === "gridplot"){
                    if ($(DOMStrings.tags).val().length > 1){

                        $(DOMStrings.$plotAddOnsArea).contents(':not('+DOMStrings.loader+')').remove();
                        gridplot(plotController.getPlotState(), DOMStrings.plotAddOnsArea);
                    } else {
                        alertify.error('Grid plot requires at least 2 tags to be selected.');
                        $(DOMStrings.plotAddOns).val('none');
                         $(DOMStrings.$plotAddOnsArea).hide();
                    }

                    $(DOMStrings.loader).hide();

                } else if ($(this).val() === 'scatterplot'){
                    scatterPlot()
                }

                else if ($(this).val() === "none"){
                    $(DOMStrings.$plotAddOnsArea).hide();
                    Plotly.purge(DOMStrings.plotAddOnsArea);
                    $(DOMStrings.$plotAddOnsArea).contents(':not('+DOMStrings.loader+')').remove();
                } else {
                    Plotly.purge(DOMStrings.plotAddOnsArea);
                    $(DOMStrings.$plotAddOnsArea).contents(':not('+DOMStrings.loader+')').remove();
                    var socket = plotController.getSocket();
                    socket.emit("add_on_event", {
                    ids: $(DOMStrings.tags).val(),
                    name: $(DOMStrings.plotAddOns).val(),
                    domain: document.getElementById(DOMStrings.plotArea).layout.xaxis.range
                    });
                }
                } else if ($(DOMStrings.plotAddOns).val() !== 'none'){
                    alertify.error("Add-ons can only be used with a single plot or subplots with linked x-axes");
                    $(DOMStrings.plotAddOns).val("none");
                }
            } else {
                alertify.error("Please create a main plot before attempting to use the addons");
                $(DOMStrings.plotAddOns).val("none");
            }

        });

        // event listener for show plugin data checkbox
        $(DOMStrings.showplugindata).on("click", function(){
            var plot = document.getElementById(DOMStrings.plotArea);
            var plugins = _.partition(plot.data, ['metadata.dataType', 'plugin'])[0];
            var indexes = [];
            if ($(this).prop('checked')){


                if (plugins.length > 0){

                    plugins.forEach(function (d, i) {
                       indexes.push(_.indexOf(plot.data, d))
                    });
                    var update = {
                        visible: true,
                        showlegend: true
                    };
                    Plotly.restyle(DOMStrings.plotArea, update, indexes);
                }

            } else if(!$(this).prop('checked')){
                    plugins.forEach(function (d, i) {
                       indexes.push(_.indexOf(plot.data, d))
                    });
                    var update = {
                        visible: false,
                        showlegend: false
                    };
                    Plotly.restyle(DOMStrings.plotArea, update, indexes);
            }
        });

        // Event listener fo show data bounds checkbox
        $(DOMStrings.showboundsCheckbox).on('click', function () {
            var plot = document.getElementById(DOMStrings.plotArea);
            var bounds = _.partition(plot.data, ['metadata.dataType', 'bounds'])[0];
            var indexes = [];
            if ($(this).prop('checked')){
                if (bounds.length > 0) {
                    bounds.forEach(function (d, i) {
                       indexes.push(_.indexOf(plot.data, d))
                    });
                    var update = {
                        visible: true,
                        showlegend: true
                    };
                    Plotly.restyle(DOMStrings.plotArea, update, indexes);
                } else {
                    showBounds();
                }
            } else if (!$(this).prop('checked')){
                bounds.forEach(function (d, i) {
                       indexes.push(_.indexOf(plot.data, d))
                    });
                    var update = {
                        visible: false,
                        showlegend: false
                    };
                    Plotly.restyle(DOMStrings.plotArea, update, indexes);
            }
        });
        //Event listener for multiple Y-Axes checkbox
        $(DOMStrings.multipleYCheckbox).on('click', function () {
            if ($(this).prop('checked')) {
                multipleYAxes(DOMStrings, true, plotController)
            } else {
                multipleYAxes(DOMStrings, false, plotController)
            }
        });
        // Event listener for logarithmic y-axis
        $(DOMStrings.showlogYaxis).on('click', function() {
            logAxis(DOMStrings, plotController.getPlotState(), $(this).prop('checked'))
        });
    };

    return {
        init: function () {
            UIController.init();
            setupEventListners();

            console.log("init");
            if (localStorage.getItem("plotState") !== null) {

                plotStateObject = new EvertPlotState();
                plotStateObject.readState(JSON.parse(localStorage.getItem("plotState")));
                var formData = plotStateObject.formData;
                DOMStrings = dataController.getDOMStrings();

                $(DOMStrings.plant).val(formData.plant);
                $(DOMStrings.plant).trigger("chosen:updated");
                $(DOMStrings.units).val(formData.units);
                $(DOMStrings.units).trigger("chosen:updated");
                $(DOMStrings.tags).val(formData.tags);
                $(DOMStrings.tags).trigger("chosen:updated");

                $(DOMStrings.subplotsCheck).prop("checked", plotStateObject.subplots);
                $(DOMStrings.multipleYCheckbox).prop('disabled', plotStateObject.subplots);
                $(DOMStrings.linkXaxesValue).prop("checked", plotStateObject.linkedXAxis);
                if (plotStateObject.subplots){
                    $(DOMStrings.linkXaxisCheckbox).show();
                }

                plotController.createPlot(plotStateObject.traces, plotStateObject.plotLayout, plotStateObject.tagsMap);
            }
        }

    };
})();
