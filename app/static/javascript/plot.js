$(document).ready(function () {
    "use strict";
    controller.init();

    var namespace = "/test";
    var socket = io.connect(location.protocol + "//" + document.domain + ":" + location.port + namespace);

    socket.on("connect", function() {

                console.log("connected");
                socket.emit("connected", {msg: "next"});
            });

    socket.on("pluginFeaturesEmit", function(data){
        plotController.uploadFeaturesData(data);
    });
});

// Data controller for plotting page
var dataController = (function () {
    var data, DOMStrings;

    // jQuery selectors for DOM objects
    DOMStrings = {
        plant: "select#plotPlant",
        units: "select#plotUnits",
        tags: "select#plotTags",
        type: "select#plotType",
        submitBtn: "input#Submit",
        deleteBtn: "button#deleteplot",
        plotArea: "#plotarea"
    };

    return {
        // executes the $.getJSON method for asynchronous data handling
        getJSONData: function (route, callback) {
            // required plotting data
            data = {
                plant: $(DOMStrings.plant).val(),
                units: $(DOMStrings.units).val(),
                tags: $(DOMStrings.tags).val(),
                type: $(DOMStrings.type).val()
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
    }
})();

// controller to handle plotting logic
var plotController = (function() {
    "use strict";
    var DOMStrings, chart, features, cdomain;
    features = [];


    DOMStrings = dataController.getDOMStrings();
    var zoomstartCallback = function () {

    };

    var renderedCallBack = function () {

            features.forEach(function(d, i){
                if (d[0] === "scatter"){            // apply custom radius and style to scatter features
                    var scatter = ".c3-circles-".concat(d[1]).concat(" > circle");
                    d3.selectAll(scatter).each(function () {
                    d3.select(this).attr("r", 3).style("opacity", 0).transition(500).style("opacity", 0.8);
                    });
                }

                else if (d[0] === "line") {         // apply custom  style to line features
                    var line = ".c3-line-".concat(d[1]);
                    d3.select(line).style("stroke-dasharray", "5,5").style("opacity", 0).transition(500).style("opacity", 1);
                }
            });
        };


    var zoomendCallback = function(domain){
                        var d = domain;
                        cdomain = domain;   // current plot window domain

                        // get new data for current plot window
                        $.getJSON("/_daterange",{
                            ids: $(DOMStrings.tags).val(),
                            domain: [d[0].getTime(), d[1].getTime()]
                        }, function (data) {
                            // checks if the return data has a domain object
                            if (data.domain !== null){
                                 data.domain = data.domain.map(function (d) {return new Date(d)});
                                //convert data domain to number
                                var dstart = +data.domain[0];
                                var dend = +data.domain[1];
                                // convert current window domain to number
                                var cstart = Math.floor(cdomain[0]/1000); // remove some precision to match python data
                                var cend = Math.floor(cdomain[1]/1000);
                                // compares the current window data to the data domain to see if they match
                                if (cstart === dstart && cend === dend){
                                    // if windows match new data is plotted
                                    var plotData = data.data;
                                    var headers = plotData.shift();
                                    // change date strings to date objects
                                    plotData.map(function (d) {
                                        d[0] = new Date(d[0]);
                                        return d;
                                    });
                                    var newData = [headers].concat(plotData);
                                    // loads new data to the chart
                                    chart.load({
                                        xs: data.datamap,
                                        rows: newData
                                    });
                                    chart.zoom([d[0], d[1]]);
                                }
                            }
                        });
                        var format = dataController.timeFormat(d);
                        var config = {
                            axis: {
                                x: {
                                    type: "timeseries",
                                    tick:{
                                        count: 30,
                                        format: format,
                                        culling:{
                                            max: 20
                                        }
                                    }
                                }
                            }
                        };
                        chart.internal.loadConfig(config);
                    };

    return {
         // rendering of plot data
        createPlot: function (data) {
            var plotData = data.data;
            var headers = plotData.shift();

            plotData.map(function (d) {
                d[0] = new Date(d[0]);

                return d;
            });

            var timeFormat = dataController.timeFormat([plotData[1][0], plotData.slice(-1)[0][0]]);
            plotData = [headers].concat(plotData);

            chart = c3.generate({
                onrendered: renderedCallBack,
                bindto: "#plot",
                transition:{
                    duration: null
                },
                data: {
                    x: "timestamp",
                    rows: plotData
                },
                axis: {
                    x: {
                        type: "timeseries",
                        localtime: true,
                        tick:{
                            format: timeFormat,
                            count: 20,
                            culling: {
                                max: 20
                            },
                            multiline: true,
                            width: 50,
                            padding:{
                                bottom: 20
                            }
                        }
                    },
                    y: {
                        tick:{
                            format: d3.format(".2f")
                            }
                        }
                    },
                zoom:{
                    enabled:true,
                    onzoomstart: zoomstartCallback,
                    onzoomend: zoomendCallback
                },
                // tooltip:{
                //     format: {
                //         title: function(d){
                //             var parse = d3.time.format("%Y-%m-%d %H:%M");
                //             return parse(d)}
                //     }
                // },
                padding:{
                    left: 50,
                    right: 50
                },
                point: {
                    r: 1
                }
            });
        },

        uploadFeaturesData: function (data) {

            var _data = data.data;


            if (data.domain !== null){
                 data.domain = data.domain.map(function (d) {return new Date(d)} );

                var dstart = data.domain[0];
                var dend = data.domain[1];

                var cstart = Math.floor(cdomain[0]/1000);
                var cend = Math.floor(cdomain[1]/1000);

            }

            if ((+cstart === +dstart && +cend === +dend) || cdomain === undefined) {
                var _datamap = data.datamap;

                 _data.map(function (d) {
                     for (var i=2; i<d.length; i++){
                         d[i][0] = new Date(d[i][0]);
                     }
                     return d;
                 });
                 // console.log(_data);

                _data.forEach(function(d, i) {
                    var type = d.splice(0, 1)[0];
                    features.push([type, d[0][1].replace(/(\u003A)|(\s)/g, "-")]);
                    chart.load({
                         xs: _datamap[i],
                         rows: d,
                         type: type
                     });
            })}

            // var _datamap = data.datamap;
            //
            //  _data.map(function (d) {
            //      for (var i=2; i<d.length; i++){
            //          d[i][0] = new Date(d[i][0]);
            //      }
            //      return d
            //  });
            //  // console.log(_data);
            //
            // _data.forEach(function(d, i) {
            //     var type = d.splice(0, 1)[0];
            //     features.push([type, d[0][1].replace(/(\u003A)|(\s)/g, "-")]);
            //     chart.load({
            //          xs: _datamap[i],
            //          rows: d,
            //          type: type
            //      });
            // })

        },
        // delete plot from plot area
        deletePlot: function() {
        chart = chart.destroy();
        }
    };
})();

// general plot page controller
var controller = (function () {
    "use strict";
    var DOMStrings;

    DOMStrings = dataController.getDOMStrings();

    // setting up event listeners
    var setupEventListners = function(){
        // Event listener for plot button
        $(DOMStrings.submitBtn).on("click", function () {
            dataController.getJSONData("/_plotdata", plotController.createPlot)});


        // Event listener for when units are selected (updates tags)
        $(DOMStrings.units).on("change", function () {
            dataController.getJSONData("/_unitchange", UIController.updateTags)
        });

        // Event listner for when the plant is changed (updates units and tags)
        $(DOMStrings.plant).on("change", function () {
            dataController.getJSONData("/_plantchangesetup", UIController.plantSetup);
        });

        // Event listener for delete button
        $(DOMStrings.deleteBtn).on("click", plotController.deletePlot)

    };

    return {
        init: function () {
            UIController.init();
            setupEventListners();
        }
    };
})();
