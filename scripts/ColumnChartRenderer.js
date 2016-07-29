/**
 * @constructor
 */
var ColumnChartRenderer = function(charts, chartProperties) {
    'use strict';
    this.charts = charts;
    this.chartProperties = chartProperties;
};

ColumnChartRenderer.prototype.displayCharts = function(height, width) {
    'use strict';
    for (var i = 0; i < this.charts.length; i++) {
        var maxY = Math.max.apply(Math, this.charts[i].yData.map(chartUtilities.nullMaxMapper));
        var minY = Math.min.apply(Math, this.charts[i].yData.map(chartUtilities.nullMinMapper));
        if (minY !== Infinity || maxY !== -Infinity) {
            this.charts[i].yTicks = this.chartProperties.calculateYAxis(minY, maxY);
            this.charts[i].xTicks = this.chartProperties.calculateYAxis(0,
                                                                   this.charts[i].xData.length);
            this.createDivs("chart-area");
        }
    }
    this.createCharts(this.charts, height, width);
};

ColumnChartRenderer.prototype.createDivs = function(targetDiv) {
    'use strict';
    var div = document.createElement('div');
    div.setAttribute('class', "multi-chart");
    div.style.display = "inline";
    var renderDiv = document.getElementById(targetDiv);
    renderDiv.appendChild(div);
};

ColumnChartRenderer.prototype.createCaptions = function(targetDiv, caption, subCaption) {
    'use strict';
    var captionHeader = document.createElement('h1');
    captionHeader.setAttribute('class', 'caption');
    var renderDiv = document.getElementById(targetDiv);
    captionHeader.innerHTML = caption;
    renderDiv.appendChild(captionHeader);
    var subCaptionHeader = document.createElement('h2');
    subCaptionHeader.setAttribute('class', 'sub-caption');
    subCaptionHeader.innerHTML = subCaption;
    renderDiv.appendChild(subCaptionHeader);
};

ColumnChartRenderer.prototype.drawCompleteCharts = function(i, charts, multiCharts,
    chartsInARow, svgHelper, svg, height, width, columnsAreComplete) {
    'use strict';
    var columnPlot;
    var mappedCharts  = [];
    var chartUbHeight = Math.ceil(height - (0.001 * height)) + 55;
    var chartUbWidth  = Math.ceil(width - (0.025 * width)) + 55;
    var chartLbHeight = Math.floor(0 + (0.2 * height)) + 55;
    var chartLbWidth  = Math.floor(0 + (0.025 * height)) + 55;
    var chartHeight   = chartUbHeight - chartLbHeight;
    var chartWidth    = chartUbWidth - chartLbWidth;

    var mappedData = this.chartProperties.dataMapper(chartHeight, chartWidth, chartLbHeight,
                                                     chartLbWidth, charts[i]);
    mappedCharts.push(mappedData);

    var yAxis = new YAxis(chartLbWidth, chartLbHeight - 55, chartLbWidth, chartUbHeight - 55,
                          "yAxis", columnsAreComplete);
    yAxis.render(svg);
    yAxis.renderTicks(svg, mappedData.yTicks);
    yAxis.renderTickValues(svg, mappedData.yTicks, charts[i].yTicks);
    yAxis.renderDivs(svg, mappedData.yTicks, chartHeight, chartLbWidth, chartWidth);
    yAxis.renderZeroPlane(svg, mappedData.yTicks, charts[i].yTicks, chartWidth);

    var xAxis = new XAxis(chartUbWidth, chartUbHeight - 55, chartLbWidth, chartUbHeight - 55,
                          "xAxis", columnsAreComplete);
    xAxis.render(svg);
    xAxis.renderTicks(svg, mappedData.xTicks);
    if (i >= multiCharts.length - chartsInARow) {
        xAxis.renderTickValues(svg, mappedData.xTicks, charts[i].xData);
    }

    var yTitleRect = svgHelper.drawRectByClass(chartLbWidth, chartLbHeight - 55 - 40, 30, chartWidth, "y-title-rect");
    svg.appendChild(yTitleRect);
    var yTitleContent = charts[i].yUnit === "" ?
        charts[i].yTitle : charts[i].yTitle + " (" + charts[i].yUnit + ")";
    var yTitle = svgHelper.drawTextByClass((chartUbWidth / 2) - 15, chartLbHeight - 55 - 20, yTitleContent,
                                           "y-title");
    svg.appendChild(yTitle);

    for (var k = 0; k < mappedData.yData.length; k++) {
        if (mappedData.yData[k] !== "") {
            var anchor = svgHelper.drawCircleByClass(mappedData.xData[k] + chartLbWidth,
                                    chartHeight - mappedData.yData[k] + chartLbHeight - 55,
                                    4, "graphCircle");
            anchor.setAttributeNS(null, "data-value", charts[i].yData[k]);
            // svg.appendChild(anchor);
            var plotWidth = (chartWidth / mappedData.xData.length) - 10;
            if(svg.getElementsByClassName("zeroPlane").length > 0) {
                var xZeroLine = svg.getElementsByClassName("zeroPlane");
                var zeroPlaneY = xZeroLine[0].getAttributeNS(null, "y1");
                if(charts[i].yData[k] < 0) {
                    var columnHeight = chartHeight - mappedData.yData[k] + chartLbHeight - 55 - zeroPlaneY;
                    columnPlot = svgHelper.drawRectByClass(mappedData.xData[k] + chartLbWidth - (plotWidth / 2),
                    zeroPlaneY - 1, columnHeight, plotWidth, "column-plot");
                } else {
                    columnPlot = svgHelper.drawRectByClass(mappedData.xData[k] + chartLbWidth - (plotWidth / 2),
                    chartUbHeight - mappedData.yData[k] - 55,
                    mappedData.yData[k] - (chartUbHeight - zeroPlaneY) + 55, plotWidth,
                    "column-plot");
                }
            } else {
                columnPlot = svgHelper.drawRectByClass(mappedData.xData[k] + chartLbWidth - (plotWidth / 2),
                chartUbHeight - mappedData.yData[k] - 55,
                mappedData.yData[k], plotWidth,
                "column-plot");
            }
            columnPlot.setAttributeNS(null, "data-value", charts[i].yData[k]);
            svg.appendChild(columnPlot);
        }
    }
};

ColumnChartRenderer.prototype.drawIncompleteCharts = function(i, charts, multiCharts,
    chartsInARow, svgHelper, svg, height, width, columnsAreComplete) {
    'use strict';
    var columnPlot;
    var mappedCharts  = [];
    var chartUbHeight = Math.ceil(height - (0.095 * height)) + 55;
    var chartUbWidth  = Math.ceil(width - (0.025 * width)) + 55;
    var chartLbHeight = Math.floor(0 + (0.025 * height)) + 55;
    var chartLbWidth  = Math.floor(0 + (0.025 * height)) + 55;
    var chartHeight   = chartUbHeight - chartLbHeight;
    var chartWidth    = chartUbWidth - chartLbWidth;

    var mappedData = this.chartProperties.dataMapper(chartHeight, chartWidth, chartLbHeight,
                                                         chartLbWidth, charts[i]);
    mappedCharts.push(mappedData);

    var yAxis = new YAxis(chartLbWidth, chartLbHeight - 15, chartLbWidth, chartUbHeight - 15,
                          "yAxis", columnsAreComplete);
    yAxis.render(svg);
    yAxis.renderTicks(svg, mappedData.yTicks);
    yAxis.renderTickValues(svg, mappedData.yTicks, charts[i].yTicks);
    yAxis.renderDivs(svg, mappedData.yTicks, chartHeight, chartLbWidth, chartWidth);
    yAxis.renderZeroPlane(svg, mappedData.yTicks, charts[i].yTicks, chartWidth);

    var xAxis = new XAxis(chartLbWidth, chartLbHeight - 15, chartLbWidth, chartLbHeight - 15,
                          "xAxis", columnsAreComplete);
    xAxis.render(svg);
    xAxis.renderTicks(svg, mappedData.xTicks);
    if(i < chartsInARow) {
        xAxis.renderTickValues(svg, mappedData.xTicks, charts[i].xData);
    }

    var yTitleRect = svgHelper.drawRectByClass(chartLbWidth, chartUbHeight - 7, 30, chartWidth, "y-title-rect");
    svg.appendChild(yTitleRect);
    var yTitleContent = charts[i].yUnit === "" ?
        charts[i].yTitle : charts[i].yTitle + " (" + charts[i].yUnit + ")";
    var yTitle = svgHelper.drawTextByClass((chartUbWidth / 2) - 15, chartUbHeight + 15, yTitleContent,
                                           "y-title");
    svg.appendChild(yTitle);

    for (var k = 0; k < mappedData.yData.length; k++) {
        if (mappedData.yData[k] !== "") {
            var anchor = svgHelper.drawCircleByClass(mappedData.xData[k] + chartLbWidth,
                                    chartHeight - mappedData.yData[k] + chartLbHeight - 15,
                                    4, "graphCircle");
            anchor.setAttributeNS(null, "data-value", charts[i].yData[k]);
            // svg.appendChild(anchor);
            var plotWidth = (chartWidth / mappedData.xData.length) - 10;
            if(svg.getElementsByClassName("zeroPlane").length > 0) {
                var xZeroLine = svg.getElementsByClassName("zeroPlane");
                var zeroPlaneY = xZeroLine[0].getAttributeNS(null, "y1");
                if(charts[i].yData[k] < 0) {
                    var columnHeight = chartHeight - mappedData.yData[k] + chartLbHeight - 15 - zeroPlaneY;
                    columnPlot = svgHelper.drawRectByClass(mappedData.xData[k] + chartLbWidth - (plotWidth / 2),
                    zeroPlaneY - 1, columnHeight, plotWidth, "column-plot");
                } else {
                    columnPlot = svgHelper.drawRectByClass(mappedData.xData[k] + chartLbWidth - (plotWidth / 2),
                    chartUbHeight - mappedData.yData[k] - 15,
                    mappedData.yData[k] - (chartUbHeight - zeroPlaneY) + 15, plotWidth,
                    "column-plot");
                }
            } else {
                columnPlot = svgHelper.drawRectByClass(mappedData.xData[k] + chartLbWidth - (plotWidth / 2),
                chartUbHeight - mappedData.yData[k] - 15,
                mappedData.yData[k], plotWidth,
                "column-plot");
            }
            columnPlot.setAttributeNS(null, "data-value", charts[i].yData[k]);
            svg.appendChild(columnPlot);
        }
    }
};

ColumnChartRenderer.prototype.createCharts = function(charts, height, width) {
    'use strict';
    var columnsAreComplete;
    var svgHelper    = new SvgHelper();
    var chartsInARow = Math.floor(window.innerWidth / (width + 55));

    var multiCharts = document.getElementsByClassName("multi-chart");
    if(multiCharts.length % chartsInARow === 0) {
        columnsAreComplete = true;
    } else {
        columnsAreComplete = false;
    }
    for (var i = 0; i < multiCharts.length; i++) {

        var svg = svgHelper.createSvgByClass(height + 55, width + 55, "chart-svg");

        if(columnsAreComplete) {
            this.drawCompleteCharts(i, charts, multiCharts, chartsInARow, svgHelper,
                svg, height, width, columnsAreComplete);
        } else {
            this.drawIncompleteCharts(i, charts, multiCharts, chartsInARow, svgHelper,
                svg, height, width, columnsAreComplete);
        }

        multiCharts[i].appendChild(svg);
        var xValueElements = svg.getElementsByClassName("x-value");
        for(var e = 0; e < xValueElements.length; e++) {
            var rotationPt = svgHelper.getRotationPoint(xValueElements[e]);
            xValueElements[e].setAttributeNS(null, "transform",
                "rotate(270 " + rotationPt + ")");
        }
    }
};