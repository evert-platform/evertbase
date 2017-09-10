$(document).ready(function () {
    "use strict";
    controller.init();

    plotController.init();
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
        subplotsCheck: "input#subplots-check",
        linkXaxesValue: "input#linkXaxesValue",
        linkXaxisCheckbox: "div#linkXcheckbox"
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
        console.log(newData);
        // names of the traces that need to be updated
        var newDataNames = _.map(newData, function(d){return d.name;});
        var plotArea = document.getElementById("plot");
        // current data visible on the plot
        var currentData = plotArea.data;
        // split data into data that must change and data that must stay the same
        var dataSplit = _.partition(currentData, function(d){return _.includes(newDataNames, d.name);});

        var updatedData = [];
        newDataNames.forEach(function(d, i){
            var dplot = _.find(dataSplit[0], ["name", d]);
            dplot.x = newData[i].x;
            dplot.y = newData[i].y;
            updatedData.push(dplot);
        });
        // update plot data
        plotArea.data = updatedData.concat(dataSplit[1]);
        // redraw plot
        Plotly.redraw(DOMStrings.plotArea);


        var selectDataIDs = function (zoomEventKey) {
            if (zoomEventKey.match(/xaxis/g)){

            }
        }

    };

    return {
         // rendering of plot data
        createPlot: function (plotData, layout, tags_map) {
            plotStateObject.resetState();

            plotData.forEach(function(d, i) {
                plotStateObject.addTrace(new EvertTrace(d.name, d.x, d.y, d.xaxis, d.yaxis, i));
            });

            plotStateObject.formData = {
                plant: $(DOMStrings.plant).val(),
                units: $(DOMStrings.units).val(),
                tags: $(DOMStrings.tags).val()
            };

            plotStateObject.tagsMap = tags_map;

            if (layout === undefined){
                if ($(DOMStrings.subplotsCheck).is(':checked')){
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
                                title: d.name,
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
                            layout["yaxis".concat(i + 1)]= {
                                showline: true,
                                ticks: "outside",
                                fixedrange: true,
                                title: d.name,
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
                    modeBarButtonsToRemove: ["autoScale2d", "resetScale2d", "sendDataToCloud"]
                });

            // Event listener for when plot is zoomed. Must be called after plot is created.
            var plotArea = document.getElementById("plot");
            plotArea.on("plotly_relayout", function(e){
                var keys = Object.keys(e);
                var names;
                console.log(keys);


                if (keys[0].match(/(xaxis[0-9]*)(?=\.range\[[0-9]\])/g) &&
                    keys[1].match(/(xaxis[0-9]*)(?=\.range\[[0-9]\])/g)){

                    var xmin = e[keys[0]];
                    var xmax = e[keys[1]];

                    if (!$(DOMStrings.subplotsCheck).is(":checked")){
                        socket.emit("zoom_event",
                        {
                            domain: [xmin, xmax],
                            ids: $(DOMStrings.tags).val()
                        });
                    } else {
                         var plotXAxes = _.map(plotArea.data, function(d){return d.xaxis;});
                         var xAxis = keys[0].match(/(xaxis[0-9]*)(?=\.range\[[0-9]\])/g)[0];
                         var xAxisNumber = xAxis.match(/([0-9])/g);
                         if (!xAxisNumber) {
                            names = _.partition(plotArea.data, function(d){
                                return _.includes(["x"], d.xaxis);
                            })[0];

                         } else if (xAxisNumber){
                             names = _.partition(plotArea.data, function(d){
                                 return _.includes(["x".concat(xAxisNumber)], d.xaxis);
                           })[0];
                         }

                         var ids = [];
                         names.forEach(function(d, i){
                             ids.push(plotStateObject.tagsMap[d.name])
                         });

                         socket.emit("zoom_event",
                        {
                            domain: [xmin, xmax],
                            ids: ids
                        });
                    }

                }
            });

            console.log(document.getElementById('plot').data);
            localStorage.setItem("plotState", JSON.stringify(plotStateObject.writeState()));
        },

        uploadFeaturesData: function (data) {

            // if (plotState.pluginNames.length === 0) {
            //
            //     plotState.pluginNames.push(data.name);
            //     var firstTraceIndex = plotState.numData();
            //     var traceIds = [];
            //     var traceNames = [];
            //
            //     data.data.forEach(function(d, i){
            //         traceIds.push(firstTraceIndex + i);
            //         traceNames.push(d.name);
            //     });
            //     plotState.pluginTraces.push({
            //         plugin: data.name,
            //         traceIDs: traceIds,
            //         traceNames: traceNames
            //     });
            //
            //
            //     Plotly.addTraces(DOMStrings.plotArea, data.data);

            // } else if (plotState.pluginNames.length !== 0) {
            //     console.log("plugins data present");
            //
            //     var pluginDataIndex = _.indexOf(plotState.pluginNames, data.name);
            //
            //     if (pluginDataIndex !== -1) {
            //         var previousTraceIDs = plotState.pluginTraces[pluginDataIndex].traceIDs;
            //
            //         Plotly.deleteTraces(DOMStrings.plotArea, previousTraceIDs);
            //         Plotly.addTraces(DOMStrings.plotArea, data.data, previousTraceIDs);
            //     }
            //
            //     else if (pluginDataIndex === -1) {
            //         console.log("pass");
            //         // TODO: add code to add plugin if others are also present
            //     }
            //
            // }



        },
        // delete plot from plot area
        deletePlot: function() {
        Plotly.purge(DOMStrings.plotArea);
        plotStateObject.resetState();
        localStorage.setItem("plotData", undefined);
        // localStorage.setItem('plotDomain', undefined);
        },
        init: function () {
            var namespace = "/test";
            socket = io.connect(location.protocol + "//" + document.domain + ":" + location.port + namespace);

            socket.on("connect", function() {
                        console.log("connected");
                    });
            //
            //
            // socket.on("pluginFeaturesEmit", function(data){
            //     console.log("pluginfeatures");
            //     console.log(data);
            //     plotController.uploadFeaturesData(data);
            // });
            // //
            socket.on("zoom_return", function(data){
                updatePlot(data);
            });

        },
        getPlotState: function(){
            return plotStateObject;
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
            dataController.getJSONData("/_plotdata", function(d) {
                plotController.createPlot(d.data, undefined, d.tags_map)
            })});


        // Event listener for when units are selected (updates tags)
        $(DOMStrings.units).on("change", function () {
            dataController.getJSONData("/_unitchange", UIController.updateTags);
        });

        // Event listener for when the plant is changed (updates units and tags)
        $(DOMStrings.plant).on("change", function () {
            dataController.getJSONData("/_plantchangesetup", UIController.plantSetup);
        });

        // Event listener for delete button
        $(DOMStrings.deleteBtn).on("click", plotController.deletePlot);

        // Event listener for subplots check button
        $(DOMStrings.subplotsCheck).on("click", function(){
            if ($(this).is(":checked")){
                $(DOMStrings.linkXaxisCheckbox).show();
                plotStateObject.subplots = true;
            } else {
                $(DOMStrings.linkXaxisCheckbox).hide();
                plotStateObject.subplots = false;
            }
        });
    };

    return {
        init: function () {
            UIController.init();
            setupEventListners();

            console.log("init");
            if (localStorage.getItem("plotState")||false) {

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

                $(DOMStrings.subplotsCheck).attr("checked", plotStateObject.subplots);
                $(DOMStrings.subplotsCheck).trigger("click");
                $(DOMStrings.linkXaxesValue).attr("checked", plotStateObject.linkedXAxis);

                plotController.createPlot(plotStateObject.traces, plotStateObject.plotLayout);
            }
        }

    };
})();
