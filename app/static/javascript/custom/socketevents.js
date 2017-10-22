function link_zoom_event(socket, DOMStrings, plotStateObject) {
    var plotArea = document.getElementById("plot");
    var plugintimeout;
    plotArea.on("plotly_relayout", function (e) {
        var keys = Object.keys(e);
        var names;
        clearTimeout(plugintimeout);

        if (keys.length > 0 && keys[0].match(/(xaxis[0-9]*)(?=\.range\[[0-9]\])/g) &&
            keys[1].match(/(xaxis[0-9]*)(?=\.range\[[0-9]\])/g)) {

            var xmin = e[keys[0]];
            var xmax = e[keys[1]];

            if (!$(DOMStrings.subplotsCheck).is(":checked")) {
                socket.emit("zoom_event",
                    {
                        domain: [xmin, xmax],
                        ids: $(DOMStrings.tags).val()
                    });

                plugintimeout = setTimeout(function(){
                    socket.emit("update_plugins_event",
                    {
                        domain: [xmin, xmax],
                        ids: $(DOMStrings.tags).val(),
                        axisMap: plotStateObject.axisMap
                    });
                }, 2000)

            } else {
                var xAxis = keys[0].match(/(xaxis[0-9]*)(?=\.range\[[0-9]\])/g)[0];
                var xAxisNumber = xAxis.match(/([0-9])/g);
                if (!xAxisNumber) {
                    names = _.partition(plotArea.data, function (d) {
                        return _.includes(["x"], d.xaxis);
                    })[0];

                } else if (xAxisNumber) {
                    names = _.partition(plotArea.data, function (d) {
                        return _.includes(["x".concat(xAxisNumber)], d.xaxis);
                    })[0];
                }

                var ids = [];
                names.forEach(function (d, i) {
                    if (plotStateObject.tagsMap[d.name]){
                        ids.push(plotStateObject.tagsMap[d.name]);
                    }
                });
                socket.emit("zoom_event",
                    {
                        domain: [xmin, xmax],
                        ids: ids,
                        axisMap: plotStateObject.axisMap
                    });

                plugintimeout = setTimeout(function(){
                    socket.emit("update_plugins_event",
                    {
                        domain: [xmin, xmax],
                        ids: ids,
                        axisMap: plotStateObject.axisMap
                    });
                }, 2000)
            }
        }

        plotStateObject.plotLayout = plotArea.layout;
    });
}

