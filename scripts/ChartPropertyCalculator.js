/**
 * Calculates and display all properties of all charts one chart at a time
 *
 * @constructor
 * @param {Object[]} MultiVarChart - An array of charts whse properties need calculating
 */
var ChartPropertyCalculator = function(charts) {
    'use strict';
    this.charts = charts;
};

ChartPropertyCalculator.prototype.dataMapper = function(height, width, lbHeight, lbWidth,
                                                        chart) {
    'use strict';
    var yTicks = [];
    var xTicks = [];
    var yData  = [];
    var xData  = [];

    var chartType = chart.type;
    var yTicksMin = chart.yTicks[0];
    var yTicksMax = chart.yTicks[chart.yTicks.length - 1];
    var xTicksMin = chart.xTicks[0];
    var xTicksMax = chart.xTicks[chart.xTicks.length - 1];
    var yDataMin  = Math.min.apply(Math, chart.yData.map(chartUtilities.nullMinMapper));
    var yDataMax  = Math.max.apply(Math, chart.yData.map(chartUtilities.nullMaxMapper));
    var xDataMin  = 0;
    var xDataMax  = chart.xData.length - 1;

    for (var yTick of chart.yTicks) {
        var yTickVal = lbHeight;
        var yTickInterval = height / (yTicksMax - yTicksMin);
        yTickVal += yTickInterval * (yTick - yTicksMin);
        yTicks.push(Math.floor(yTickVal));
    }
    for (var yDatum of chart.yData) {
        if (yDatum === "") {
            yData.push("");
        } else {
            var yDataVal  = 0;
            var yInterval = height / (yTicksMax - yTicksMin);
            yDataVal += yInterval * (yDatum - yTicksMin);
            yData.push(Math.floor(yDataVal));
        }
    }
    // yTicks.push(tickVal);
    if(chartType === "column") {
        var divDiff = Math.floor((width - 80) / (chart.xData.length - 1));
        var tickVal = lbWidth + 40;
        for (var xTick of chart.xData) {
            xTicks.push(tickVal);
            tickVal += divDiff;
        }
        for (var i = 0; i <= xDataMax; i++) {
            var xDataVal = 40;
            var xInterval = (width - 80) / (xDataMax - xDataMin);
            if (i === 0) {
                xDataVal += xInterval * (i - xTicksMin);
            } else {
                xDataVal += xInterval * (i - xDataMin);
            }
            xData.push(Math.floor(xDataVal));
        }
    } else {
        var divDiff = Math.floor(width / (chart.xData.length - 1));
        var tickVal = lbWidth;
        for (var xTick of chart.xData) {
            xTicks.push(tickVal);
            tickVal += divDiff;
        }
        for (var i = 0; i <= xDataMax; i++) {
            var xDataVal = 0;
            var xInterval = width / (xDataMax - xDataMin);
            if (i === 0) {
                xDataVal += xInterval * (i - xTicksMin);
            } else {
                xDataVal += xInterval * (i - xDataMin);
            }
            xData.push(Math.floor(xDataVal));
        }
    }
    var mappedChart = new MappedChart(chart.index, chart.xTitle,
        chart.yTitle, xData, yData, yTicks, xTicks);
    return mappedChart;
};

/**
 * Calculates the tick mark values so that the axes look pretty
 * @param {number} yMin - The minimum value of the user given Y data
 * @param {number} yMin - The maximum value of the user given Y data
 * @param {number} [ticks=8] - An optional value suggesting the number of ticks to be used
 */
ChartPropertyCalculator.prototype.calculateYAxis = function(yMin, yMax, ticks) {
    'use strict';
    ticks = typeof ticks != 'undefined' ? ticks : 8;
    var tickValues = [];
    if (yMin === yMax) {
        yMin = yMin - 1;
        yMax = yMax + 1;
    }
    var range = yMax - yMin;
    if (ticks < 2) {
        ticks = 2;
    } else if (ticks > 2) {
        ticks -= 2;
    }
    var roughStep  = range / ticks;
    var prettyMod  = Math.floor(Math.log(roughStep) / Math.LN10);
    var prettyPow  = Math.pow(10, prettyMod);
    var prettyDiv  = Math.floor(roughStep / prettyPow + 0.5);
    var prettyStep = prettyDiv * prettyPow;

    var lb  = prettyStep * Math.floor(yMin / prettyStep);
    var ub  = prettyStep * Math.ceil(yMax / prettyStep);
    var val = lb;
    while (1) {
        tickValues.push(Math.round((val + 0.00001) * 1000) / 1000);
        val += prettyStep;
        if (val > ub) {
            break;
        }
    }
    return tickValues;
};