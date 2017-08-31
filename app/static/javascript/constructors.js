function evertTrace(name, xdata, ydata, xaxis, yaxis) {
    this.name = name;
    this.xdata = xdata;
    this.ydata = ydata;
    this.xaxis = xaxis;
    this.yaxis = yaxis;
}

function evertState() {
    this.traces = [];
    this.layout = undefined;

    this.addTrace = function(trace){
        this.traces.push(trace)
    };

    this.clearTraces = function(){
        this.traces = []
    }
}


