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
    Plotly.plot(plotAddOnArea, traces, layout);
}

function showBounds() {
    var plot = document.getElementById('plot');
    var currentData = plot.data;
    var currentLayout = plot.layout;

    var bounds = [];

    var dataTraces = _.partition(currentData, ['metadata.dataType', 'data'])[0];

    dataTraces.forEach(function (d) {
        var xbounds;
        var xaxis = d.xaxis;
        var yaxis = d.yaxis;
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
        $.notify('No bounds available for selected data sets.', {
                position: "top center",
                className: "error"
        });
    }

}



