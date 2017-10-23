function gridplot(plotState, plotAddOnArea) {

    var data = [];
    var traces = [];
    var layout = {showlegend: false};


    plotState.traces.forEach(function(d, i){
        data.push({
            name: d.name,
            values: d.y,
        })
    });
    var diag = 1;
    var pos = 0;
    var frac = 1/data.length;
    for (var i=1; i<data.length + 1; i++) {
        for (var j=1; j < data.length + 1; j++) {
            pos++;
             var datai = data[j - 1];
             // setting up gridplot traces
            if (pos === diag) {
                traces.push({
                    name: datai.name,
                    x: data[i-1].values,
                    type: 'histogram',
                    mode: 'markers',
                    marker: {
                        line: {
                            color: "rgba(191, 191, 191, 0.8)",
                            width: 1
                        }
                    },
                    xaxis: 'x'.concat(pos),
                    yaxis: 'y'.concat(pos)
                });
                diag += data.length + 1

            } else {
                traces.push({
                    name: datai.name,
                    x: data[j-1].values,
                    y: data[i-1].values,
                    type: 'scatter',
                    mode: 'markers',
                    xaxis: 'x'.concat(pos),
                    yaxis: 'y'.concat(pos),
                    marker: {
                        opacity: 0.6
                    },
                    metadata: {
                        dataType: 'addons'
                    }
                })
            }

            // Setting up gridplot layout
            if (j===1 && i===1){
                layout.xaxis1 = {
                    domain: [frac*(j-1) + 0.09 , frac*(j)],
                    title: data[j-1].name,
                    showline: true,
                    ticks: 'outside'
                };
                layout.yaxis1 = {
                    domain: [frac*(i-1) + 0.09 , frac*(i)],
                    title: data[i-1].name,
                    showline: true,
                    ticks: 'outside'
                }
            } else if (i === 1 && j > 1){
                layout['xaxis'.concat(pos)] = {
                    domain:[frac*(j-1) + 0.09 , frac*(j)],
                    title: data[j-1].name,
                    showline: true,
                    ticks: 'outside'
                };
                layout['yaxis'.concat(pos)] = {
                    domain: [frac*(i-1) + 0.09 , frac*(i)],
                    anchor: 'x'.concat(pos),
                    showline: true,
                    ticks: 'outside'
                }
            } else if (i > 1 && j === 1){
                layout['xaxis'.concat(pos)] = {
                    domain: [frac*(j-1) + 0.09 , frac*(j)],
                    anchor: 'y'.concat(pos),
                    showline: true,
                    ticks: 'outside'
                };
                layout['yaxis'.concat(pos)] = {
                    domain: [frac*(i-1) + 0.09 , frac*(i)],
                    title: data[i-1].name,
                    showline: true,
                    ticks: 'outside'
                }
            } else if (i > 1 && j >  1) {
                layout['xaxis'.concat(pos)] = {
                    domain: [frac*(j-1) + 0.09 , frac*(j)],
                    anchor: 'y'.concat(pos),
                    showline: true,
                    ticks: 'outside'
                };
                layout['yaxis'.concat(pos)] = {
                    domain: [frac*(i-1) + 0.09 , frac*(i)],
                    anchor: 'x'.concat(pos),
                    showline: true,
                    ticks: 'outside'
                };
            }
        }
    }
    layout.margin = {
        l:20,
        t: 20
    };

    Plotly.plot(plotAddOnArea, traces, layout);
    $('div#loaderWrapper').hide();
}

function showBounds() {
    var plot = document.getElementById('plot');
    var currentData = plot.data;
    var currentLayout = plot.layout;

    var bounds = [];

    var dataTraces = _.partition(currentData, ['metadata.dataType', 'data'])[0];

    dataTraces.forEach(function (d) {
        var xbounds;
        var xaxis = d.xaxis || 'x';
        var yaxis = d.yaxis || 'y';
        var xaxisnumber = xaxis.match(/\d+/g);
        if (xaxisnumber === null){
            xbounds = currentLayout['xaxis'].range
        } else {
            xbounds = currentLayout['xaxis'.concat(xaxisnumber[0])].range
        }
        var lowerbound = d.metadata.min;
        var upperbound = d.metadata.max;

        if (lowerbound && upperbound){
            bounds.push({
            name: d.name + ': lower bound',
            x: xbounds,
            y: [d.metadata.min, d.metadata.min],
            xaxis: xaxis,
            yaxis:yaxis,
            type: 'scatter',
            mode: 'lines',
            line: {
                dash: 'longdash',
                width: 1
            },
            metadata:{
                dataType: 'bounds'
            }

        },{
            name: d.name + ': upper bound',
            x: xbounds,
            y: [d.metadata.max, d.metadata.max],
            xaxis: xaxis,
            yaxis:yaxis,
            type: 'scatter',
            mode: 'lines',
            line: {
                dash: 'longdash',
                width: 1
            },
            metadata:{
                dataType: 'bounds'
            }
        });
        } else if (lowerbound && !upperbound){
            bounds.push({
            name: d.name + ': lower bound',
            x: xbounds,
            y: [d.metadata.min, d.metadata.min],
            xaxis: xaxis,
            yaxis:yaxis,
            type: 'scatter',
            mode: 'lines',
            line: {
                dash: 'longdash',
                width: 1
            },
            metadata:{
                dataType: 'bounds'
            }
            })
        } else if (!lowerbound && upperbound) {
            bounds.push({
            name: d.name + ': upper bound',
            x: xbounds,
            y: [d.metadata.max, d.metadata.max],
            xaxis: xaxis,
            yaxis:yaxis,
            type: 'scatter',
            mode: 'lines',
            line: {
                dash: 'longdash',
                width: 1
            },
            metadata:{
                dataType: 'bounds'
            }
            })
        }


    });
    if (bounds.length > 0){
        Plotly.addTraces('plot', bounds)
    } else {
        $('input#showDataBounds').prop('checked', false);
        allertify.error('No bounds available for selected data sets.');
    }

}

function multipleYAxes(DOMStrings, show, plotController){
    var plot = document.getElementById('plot');
    var currentData = plot.data;
    var currentLayout = plot.layout;
    var dataTraces = _.partition(currentData, ['metadata.dataType', 'data'])[0];
    var otherData = _.partition(currentData, ['metadata.dataType', 'data'])[1];
    var range = currentLayout.xaxis.range;

    var colors = ['#1f77b4','#ff7f0e', '#2c9f2c', '#d62728', '#9467BD', '#8C564B', '#E377C2', '#7F7F7F', '#BCBD22', '#17BECF'];
    if(show){
        if (dataTraces.length <= colors.length){
            dataTraces.forEach(function(d, i){
                d.yaxis = 'y'.concat(i + 1);
                d.showlegend = false;

                currentLayout['yaxis'.concat(i + 1)] = {
                    title: d.name,
                    anchor: 'free',
                    side: 'left',
                    position: 0.08 * i,
                    overlaying: i+1 > 1 ? 'y':undefined,
                    showline: true,
                    ticks: 'outside',
                    tickfont: {color: colors[i]},
                    color: colors[i]
                }
            });



            currentLayout.xaxis = {
                domain: [0.08*(dataTraces.length-1), 1],
                showline: true,
                ticks: 'outside',
                range: range
            };

            var correctedOtherData = [];

            otherData.forEach(function(d, i) {
                var baseDataName = d.metadata.baseData;
                var baseDataObject = _.find(dataTraces, ['name', baseDataName]);
                var baseXAxis = baseDataObject.xaxis || 'x1';
                var baseYAxis = baseDataObject.yaxis || 'y1';

                d.xaxis = baseXAxis;
                d.yaxis = baseYAxis;
                correctedOtherData.push(d)
            });
            dataTraces = dataTraces.concat(correctedOtherData);
            // currentLayout.showlegend = false;
            delete currentLayout.yaxis;


            plot.data = dataTraces;
            plot.layout = currentLayout;
            Plotly.redraw('plot')
            } else {
            alertify.error('No more than ' + colors.length + ' tags allowed for multiple axes');
        }

    } else if (!show){

        currentData.forEach(function (d, i) {
            delete d.xaxis;
            delete d.yaxis;
            d.showlegend = true;
        });

        currentLayout = {
            xaxis: {
                showline: true,
                ticks: 'outside',
                range: range
            },
            yaxis: {
                showline: true,
                ticks: 'outside'
            },
            showlegend: true
        };

        Plotly.newPlot('plot', currentData, currentLayout);
        link_zoom_event(plotController.getSocket(), DOMStrings, plotController.getPlotState())

    }

}

function scatterPlot() {

    var currentPlot = document.getElementById('plot');
    var currentData = currentPlot.data;

    currentData.forEach(function(d, i){
        delete d.xaxis;
        delete d.yaxis;
    });

    var plotData = function(xname, yname){
        var xdata = _.find(currentData, ['name', xname]).y;
        var ydata = _.find(currentData, ['name', yname]).y;
        var data, layout;

        if (xdata === ydata) {
            data = {
                x: ydata,
                type: 'histogram',
                mode: 'markers',
                    marker: {
                        line: {
                            color: "rgba(191, 191, 191, 0.8)",
                            width: 1
                        }
                    }
            };

            layout = {
                showlegend: false,
                xaxis: {
                    showline: true,
                    ticks: 'outside',
                    title: xname + ' Data Distribution'
                },
                yaxis: {
                    showline: true,
                    ticks: 'outside'
                },
                margin: {
                    t:20
                }
            }

        } else {
            data = {
                name: 'scatter',
                x: xdata,
                y: ydata,
                type: 'scatter',
                mode: 'markers'
            };

            layout = {
                showlegend: false,
                xaxis: {
                    showline: true,
                    ticks: 'outside',
                    title: xname
                },
                yaxis: {
                    showline: true,
                    ticks: 'outside',
                    title: yname
                },
                margin: {
                    t:20
                }
            };
        }

        Plotly.newPlot('scatterplotArea', [data], layout);


    };

    var scatterplot = document.getElementById('scatterplotArea');
    var names = currentData.map(function(d){return d.name});
    if (scatterplot === null){
        $('div#plotAddOnsArea').append(
        "<div id='scatterplotHTML' class='container row'>"+
             "<div class='col-sm-3 col-md-3 col-lg-3'>"+
                "<div>" +
                    "<label for='xaxis'>X-Axis:</label>" +
                    "<select class='form-control' id='xaxis'></select>" +
                "</div>"+
                "<div>" +
                    "<label for='yaxis'>Y-Axis:</label>" +
                    "<select class='form-control' id='yaxis'></select>" +
                "</div>"+
             "</div>" +
            "<div style='min-height: 500px' id='scatterplotArea' class='col-sm-9 col-md-9 col-lg-9'></div>" +
         "</div>"
    );

    var $selectyaxis = $('select#yaxis');
    var $selectxaxis = $('select#xaxis');


    var updateSelect = function (selector, data) {
            selector.empty();
            $.each(data, function (value, key) {
                selector.append($("<option class=></option>")
                    .attr("value", key).text(key))
            });
    };

    updateSelect($selectyaxis, names);
    updateSelect($selectxaxis, names);

    if (names.length > 1){
        $selectxaxis.val(names[0]);
        $selectyaxis.val(names[1]);
        plotData(names[0], names[1]);
    } else if (names.length === 1){
        $selectxaxis.val(names[0]);
        $selectyaxis.val(names[0]);
        plotData(names[0], names[0]);
    }

    } else {
        var $selectyaxis = $('select#yaxis');
        var $selectxaxis = $('select#xaxis');

        plotData($selectxaxis.val(), $selectyaxis.val())
    }



    $selectxaxis.on('change', function(){
        var x = $selectxaxis.val();
        var y = $selectyaxis.val();
        plotData(x, y);
    });

    $selectyaxis.on('change', function(){
        var x = $selectxaxis.val();
        var y = $selectyaxis.val();
        plotData(x, y);
    });

    $('div#loaderWrapper').hide()

}



