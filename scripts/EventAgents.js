;(function() {
    'use strict';
    /**
     * @constructor
     */
    Chart.EventAgents = function(chartType, chartVis) {
        this.chartType = chartType;
        this.chartVis  = chartVis;
        this.svgHelper = new Chart.SvgHelper();
        if(document.getElementsByClassName("graphCircle")[0]) {
            this.defaultAnchorStroke = getComputedStyle(document.getElementsByClassName("graphCircle")[0]).stroke;
            this.defaultAnchorFill   = getComputedStyle(document.getElementsByClassName("graphCircle")[0]).fill;
        }
        if(document.getElementsByClassName("column-plot")[0]) {
            this.defaultPlotFill = getComputedStyle(document.getElementsByClassName("column-plot")[0]).fill;
        }
    };

    Chart.EventAgents.prototype.createCrosshair = function(event) {
        var mouseOffset = event.target.getBoundingClientRect().left;
        var crosshairCreation = new CustomEvent("crosshairCreateEvent", {
            "detail": event.clientX - mouseOffset + 71
        });
        for (var rect of document.getElementsByClassName("chart-rect")) {
            rect.dispatchEvent(crosshairCreation);
        }
    };

    Chart.EventAgents.prototype.createOtherCrosshairs = function(event) {
        var targetSvgHeight = Number(event.target.getAttributeNS(null, "height"));
        var targetSvgY      = Number(event.target.getAttributeNS(null, "y"));
        var crosshair, tooltip, tooltipBg;
        if (targetSvgHeight) {
            crosshair = this.svgHelper.drawLineByClass(event.detail, targetSvgY, event.detail,
                                                       targetSvgHeight + targetSvgY, "otherCrosshair");
            event.target.parentNode.insertBefore(crosshair, event.target);

            tooltipBg = this.svgHelper.drawRectByClass(event.detail, targetSvgHeight, 20, 60,
                                                       "otherTooltipBg");
            tooltipBg.setAttributeNS(null, "rx", 2);
            tooltipBg.setAttributeNS(null, "ry", 2);
            tooltipBg.style.visibility = "hidden";
            event.target.parentNode.insertBefore(tooltipBg, event.target);

            tooltip = this.svgHelper.drawTextByClass(event.detail, targetSvgHeight, "",
                                                     "otherTooltip");
            tooltip.style.visibility = "hidden";
            event.target.parentNode.insertBefore(tooltip, event.target);
        }
    };

    Chart.EventAgents.prototype.moveCrosshair = function(event) {
        var mouseOffset = event.target.getBoundingClientRect().left;
        var crosshairMovement = new CustomEvent("crosshairMoveEvent", {
            "detail": event.clientX - mouseOffset + 71
        });
        for (var rect of document.getElementsByClassName("chart-rect")) {
            rect.dispatchEvent(crosshairMovement);
        }
    };

    Chart.EventAgents.prototype.moveOtherCrosshairs = function(event) {
        var crosshairs = event.target.parentNode.getElementsByClassName("otherCrosshair");
        var tooltips   = event.target.parentNode.getElementsByClassName("otherTooltip");
        var tooltipBgs = event.target.parentNode.getElementsByClassName("otherTooltipBg");
        var anchors    = event.target.parentNode.getElementsByClassName("graphCircle");
        var graphLines = event.target.parentNode.getElementsByClassName("graphLine");
        var defaultAnchorStroke = getComputedStyle(anchors[0]).stroke;
        var graphLineBox, graphLineStartX, graphLineStartY, graphLineEndX, graphLineEndY,
            crosshairStartX, crosshairStartY, crosshairEndX, crosshairEndY, crosshairBox,
            crossHairRect,
            tooltipX, tooltipY,
            tooltipBgX, tooltipBgY,
            prevAnchorData, anchorData, anchorRect, anchorBox,
            chartRect;

        crosshairs[0].setAttributeNS(null, "x1", event.detail - 9);
        crosshairs[0].setAttributeNS(null, "x2", event.detail - 9);
        crosshairBox    = crosshairs[0].getBoundingClientRect();
        crosshairStartX = crosshairs[0].getAttributeNS(null, "x1");
        crosshairStartY = crosshairs[0].getAttributeNS(null, "y1");
        crosshairEndX   = crosshairs[0].getAttributeNS(null, "x2");
        crosshairEndY   = crosshairs[0].getAttributeNS(null, "y2");
        if(crosshairs[0].getBoundingClientRect().left < anchors[0].getBoundingClientRect().left ||
            crosshairs[0].getBoundingClientRect().right > anchors[anchors.length - 1].getBoundingClientRect().right) {
            tooltips[0].style.visibility = "hidden";
            tooltipBgs[0].style.visibility = "hidden";
            anchors[0].style.stroke = this.defaultAnchorStroke;
            anchors[anchors.length - 1].style.stroke = this.defaultAnchorStroke;
            anchors[0].setAttributeNS(null, "r", 4);
            anchors[anchors.length - 1].setAttributeNS(null, "r", 4);
        } else {
            for (var i = 1; i < anchors.length; i++) {
                graphLineBox    = graphLines[i - 1].getBoundingClientRect();
                graphLineStartX = graphLines[i - 1].getAttributeNS(null, "x1");
                graphLineStartY = graphLines[i - 1].getAttributeNS(null, "y1");
                graphLineEndX   = graphLines[i - 1].getAttributeNS(null, "x2");
                graphLineEndY   = graphLines[i - 1].getAttributeNS(null, "y2");
                anchorData      = anchors[i].getAttributeNS(null, "data-value");
                prevAnchorData  = anchors[i - 1].getAttributeNS(null, "data-value");
                if (Chart.chartUtilities.isSvgColliding(graphLineBox, crosshairBox)) {
                    var intersect = Chart.chartUtilities.getLineIntersectionPoint(crosshairStartX,
                                                                            crosshairStartY,
                                                                            crosshairEndX,
                                                                            crosshairEndY,
                                                                            graphLineStartX,
                                                                            graphLineStartY,
                                                                            graphLineEndX,
                                                                            graphLineEndY);

                    var interpolatedVal = Chart.chartUtilities.getInterpolatedVal(graphLineStartX,
                                                                            prevAnchorData,
                                                                            graphLineEndX,
                                                                            anchorData,
                                                                            intersect.x);
                    tooltips[0].style.visibility = "initial";
                    tooltips[0].setAttributeNS(null, "x", intersect.x + 6);
                    tooltips[0].setAttributeNS(null, "y", intersect.y + 20);
                    tooltips[0].textContent = interpolatedVal;
                    tooltipBgs[0].style.visibility = "initial";
                    tooltipBgs[0].setAttributeNS(null, "x", intersect.x + 4);
                    tooltipBgs[0].setAttributeNS(null, "y", intersect.y + 5);
                    tooltipBgs[0].setAttributeNS(null, "width",
                                                 tooltips[0].getComputedTextLength() + 6);
                }
            }
            for (i = 0; i < anchors.length; i++) {
                anchorBox       = anchors[i].getBBox();
                anchorRect      = anchors[i].getBoundingClientRect();
                chartRect       = event.target.getBoundingClientRect();
                crossHairRect   = crosshairs[0].getBoundingClientRect();
                if (Chart.chartUtilities.isSvgColliding(anchorRect, crossHairRect)) {
                    tooltips[0].style.visibility   = "initial";
                    tooltipBgs[0].style.visibility = "initial";
                    tooltipX   = anchorBox.x + (anchorBox.width) + 5;
                    tooltipBgX = anchorBox.x + (anchorBox.width) + 3;
                    tooltipY   = anchorBox.y + (anchorBox.height * 2);
                    tooltipBgY = anchorBox.y + anchorBox.height - 3;
                    if (tooltipX + anchorBox.width + chartRect.left > chartRect.right) {
                        tooltipX   -= (anchorBox.width * 5) - 5;
                        tooltipBgX -= (anchorBox.width * 5) - 5;
                    }
                    tooltips[0].setAttributeNS(null, "x", tooltipX);
                    tooltips[0].setAttributeNS(null, "y", tooltipY + 3);
                    tooltips[0].textContent = anchors[i].getAttributeNS(null, "data-value");
                    anchors[i].setAttributeNS(null, "r", 5);
                    anchors[i].style.stroke = "#f15c5c";
                    tooltipBgs[0].setAttributeNS(null, "x", tooltipBgX);
                    tooltipBgs[0].setAttributeNS(null, "y", tooltipBgY);
                    tooltipBgs[0].setAttributeNS(null, "width",
                        tooltips[0].getComputedTextLength() + 6);
                } else {
                    anchors[i].setAttributeNS(null, "r", 4);
                    anchors[i].style.stroke = this.defaultAnchorStroke;
                }
            }
        }
    };

    Chart.EventAgents.prototype.removeCrosshair = function(event) {
        var crosshairRemoval = new Event("crosshairRemoveEvent");
        for (var rect of document.getElementsByClassName("chart-rect")) {
            rect.dispatchEvent(crosshairRemoval);
        }
    };

    Chart.EventAgents.prototype.removeOtherCrosshairs = function(event) {
        var crosshairs = event.target.parentNode.getElementsByClassName("otherCrosshair");
        var tooltips   = event.target.parentNode.getElementsByClassName("otherTooltip");
        var anchors    = event.target.parentNode.getElementsByClassName("graphCircle");
        var tooltipBgs = event.target.parentNode.getElementsByClassName("otherTooltipBg");

        for (var crosshair of crosshairs) {
            event.target.parentNode.removeChild(crosshair);
        }
        for(var anchor of anchors) {
            anchor.style.stroke = this.defaultAnchorStroke;
            anchor.setAttributeNS(null, "r", 4);
        }
        for (var tooltip of tooltips) {
            event.target.parentNode.removeChild(tooltip);
        }
        for (var tooltipBg of tooltipBgs) {
            event.target.parentNode.removeChild(tooltipBg);
        }
    };

    Chart.EventAgents.prototype.prepPlot = function(event) {
        var mouseLeftOffset = event.target.getBoundingClientRect().left;
        var mouseTopOffset  = event.target.getBoundingClientRect().top;
        var plotx           = event.target.getAttributeNS(null, "x");
        var ploty           = event.target.getAttributeNS(null, "y");
        var plotHighlight   = new CustomEvent("plotLightEvent", {
            "detail": {
                "mousex"      : event.clientX - mouseLeftOffset + 62,
                "mousey"      : event.clientY - mouseTopOffset + 3,
                "hoveredPlotX": plotx,
                "hoveredPlotY": ploty
            }
        });
        for(var plot of document.getElementsByClassName("column-plot")) {
            plot.dispatchEvent(plotHighlight);
        }
    };
    Chart.EventAgents.prototype.prepAllPlots = function(event) {
        var tooltip, tooltipBg;
        var hoveredPlotX = Math.floor(Number(event.detail.hoveredPlotX) * 1000) / 1000;
        var hoveredPlotY = Math.floor(Number(event.detail.hoveredPlotY) * 1000) / 1000;
        var targetBBoxX = Math.floor(event.target.getBBox().x * 1000) / 1000;
        var targetBBoxY = Math.floor(event.target.getBBox().y * 1000) / 1000;
        if(this.chartType !== "bar" && targetBBoxX == hoveredPlotX) {
            event.target.style.fill = "#b94748";
        } else if(this.chartType === "bar" && targetBBoxY == hoveredPlotY) {
            event.target.style.fill = "#b94748";
        }
        tooltipBg = this.svgHelper.drawRectByClass(event.detail.mousex, event.detail.mousey, 20, 60,
                                                   "otherTooltipBg");
        tooltipBg.setAttributeNS(null, "rx", 2);
        tooltipBg.setAttributeNS(null, "ry", 2);
        tooltipBg.style.visibility = "hidden";
        event.target.parentNode.appendChild(tooltipBg);
        tooltip = this.svgHelper.drawTextByClass(event.detail.mousex, event.detail.mousey, "",
                                                 "otherTooltip");
        event.target.parentNode.appendChild(tooltip);
    };
    Chart.EventAgents.prototype.prepTooltips = function(event) {
        var mouseLeftOffset = event.target.parentNode.getBoundingClientRect().left;
        var mouseTopOffset  = event.target.parentNode.getBoundingClientRect().top;
        var plotx           = event.target.getAttributeNS(null, "x");
        var ploty           = event.target.getAttributeNS(null, "y");
        var tooltipMovement = new CustomEvent("tooltipMoveEvent", {
            "detail": {
                "mousex": event.clientX - mouseLeftOffset - 15,
                "mousey": event.clientY - mouseTopOffset + 15,
                "hoveredPlotX": plotx,
                "hoveredPlotY": ploty
            }
        });
        for (var plot of document.getElementsByClassName("column-plot")) {
            plot.dispatchEvent(tooltipMovement);
        }
    };
    Chart.EventAgents.prototype.moveTooltips = function(event) {
        var tooltips   = event.target.parentNode.getElementsByClassName("otherTooltip");
        var tooltipBgs = event.target.parentNode.getElementsByClassName("otherTooltipBg");
        var hoveredPlotX = Math.floor(Number(event.detail.hoveredPlotX) * 1000) / 1000;
        var hoveredPlotY = Math.floor(Number(event.detail.hoveredPlotY) * 1000) / 1000;
        var targetBBoxX = Math.floor(event.target.getBBox().x * 1000) / 1000;
        var targetBBoxY = Math.floor(event.target.getBBox().y * 1000) / 1000;
        if(this.chartType !== "bar" && targetBBoxX == hoveredPlotX) {
            tooltipBgs[0].style.visibility = "initial";
            tooltipBgs[0].setAttributeNS(null, "x", event.detail.mousex);
            tooltipBgs[0].setAttributeNS(null, "y", event.detail.mousey);
            tooltips[0].textContent = event.target.getAttributeNS(null, "data-value");
            tooltips[0].setAttributeNS(null, "x", event.detail.mousex + 5);
            tooltips[0].setAttributeNS(null, "y", event.detail.mousey + 15);
            tooltipBgs[0].setAttributeNS(null, "width", tooltips[0].getComputedTextLength() + 10);
        } else if(this.chartType === "bar" && targetBBoxY == hoveredPlotY) {
            tooltipBgs[0].style.visibility = "initial";
            tooltipBgs[0].setAttributeNS(null, "x", event.detail.mousex);
            tooltipBgs[0].setAttributeNS(null, "y", event.detail.mousey);
            tooltips[0].textContent = event.target.getAttributeNS(null, "data-value");
            tooltips[0].setAttributeNS(null, "x", event.detail.mousex + 5);
            tooltips[0].setAttributeNS(null, "y", event.detail.mousey + 15);
            tooltipBgs[0].setAttributeNS(null, "width", tooltips[0].getComputedTextLength() + 10);
        }
    };
    Chart.EventAgents.prototype.unprepPlot = function(event) {
        var unprepAllPlots = new Event("unprepPlotEvent");
        for (var plot of document.getElementsByClassName("column-plot")) {
            plot.dispatchEvent(unprepAllPlots);
        }
    };
    Chart.EventAgents.prototype.unprepAllPlots = function(event) {
        if(event.target.style.fill === "rgb(185, 71, 72)") {
            event.target.style.fill = this.defaultPlotFill;
        }
        var tooltips   = event.target.parentNode.getElementsByClassName("otherTooltip");
        var tooltipBgs = event.target.parentNode.getElementsByClassName("otherTooltipBg");
        for (var tooltip of tooltips) {
            event.target.parentNode.removeChild(tooltip);
        }
        for (var tooltipBg of tooltipBgs) {
            event.target.parentNode.removeChild(tooltipBg);
        }
    };

    Chart.EventAgents.prototype.dragSelect = function(event) {
        var svg = event.target.parentNode;
        var mouseLeftOffset = svg.getBoundingClientRect().left;
        var mouseTopOffset  = svg.getBoundingClientRect().top;
        var customDragSelect = new CustomEvent("customDragSelect", {
            "detail": {
                "mousex": event.clientX - mouseLeftOffset,
                "mousey": event.clientY - mouseTopOffset
            }
        });
        for(var chartSvg of document.getElementsByClassName("chart-svg")) {
            chartSvg.dispatchEvent(customDragSelect);
        }
    };
    Chart.EventAgents.prototype.customDragSelect = function(event) {
        for (var plot of document.getElementsByClassName("column-plot")) {
            plot.style.fill = this.defaultPlotFill;
        }
        for (var anchor of document.getElementsByClassName("graphCircle")) {
            anchor.style.fill = this.defaultAnchorFill;
        }
        event.target.onmousemove = this.expandSelect;
        event.target.onmouseup = this.selectPlots;
        var selectBox = this.svgHelper.drawRectByClass(event.detail.mousex,
            event.detail.mousey, 5, 5, "select-box");
        selectBox.setAttributeNS(null, "fill", "red");
        selectBox.setAttributeNS(null, "fill-opacity", 0.4);
        event.target.appendChild(selectBox);
    };
    Chart.EventAgents.prototype.expandSelect = function(event) {
        var svg = event.target.parentNode;
        var mouseLeftOffset = svg.getBoundingClientRect().left;
        var mouseTopOffset  = svg.getBoundingClientRect().top;
        var customExpandSelect = new CustomEvent("customExpandSelect", {
            "detail": {
                "mousex": event.clientX - mouseLeftOffset,
                "mousey": event.clientY - mouseTopOffset
            }
        });
        for(var chartSvg of document.getElementsByClassName("chart-svg")) {
            chartSvg.dispatchEvent(customExpandSelect);
        }
    };
    Chart.EventAgents.prototype.customExpandSelect = function(event) {
        var svg = event.target.parentNode;
        var svgRect = svg.getBoundingClientRect();
        var selectBoxes = svg.getElementsByClassName("select-box");
        var columnPlots = event.target.parentNode.getElementsByClassName("column-plot");
        var anchorPlots = event.target.parentNode.getElementsByClassName("graphCircle");
        for(var selectBox of selectBoxes) {
            selectBox.setAttributeNS(null, "width", event.detail.mousex);
            selectBox.setAttributeNS(null, "height", event.detail.mousey);
            for(var columnPlot of columnPlots) {
                if(Chart.chartUtilities.isSvgColliding(selectBoxes[0].getBoundingClientRect(),
                    columnPlot.getBoundingClientRect())) {
                    columnPlot.style.fill = "#b94749";
                }
            }
            for(var anchorPlot of anchorPlots) {
                if(Chart.chartUtilities.isSvgColliding(selectBoxes[0].getBoundingClientRect(),
                    anchorPlot.getBoundingClientRect())) {
                    anchorPlot.style.fill = "#b94749";
                }
            }
        }
    };
    Chart.EventAgents.prototype.selectPlots = function(event) {
        var customSelectPlots = new Event("customSelectPlots");
        for(var chartSvg of document.getElementsByClassName("chart-svg")) {
            chartSvg.dispatchEvent(customSelectPlots);
        }
    };
    Chart.EventAgents.prototype.customSelectPlots = function(event) {
        event.target.onmouseup = null;
        event.target.onmousemove = null;
        var selectBoxes = document.getElementsByClassName("select-box");
        event.target.removeChild(selectBoxes[0]);
    };

    Chart.EventAgents.prototype.crosshairHandler = function(svgs) {
        if(this.chartVis !== "crosstab") {
            for(var svg of svgs) {
                if(this.chartType === "column" || this.chartType === "bar") {
                    for(var plot of svg.getElementsByClassName("column-plot")) {
                        plot.addEventListener("mouseenter", this.prepPlot);
                        plot.addEventListener("plotLightEvent", this.prepAllPlots.bind(this));
                        plot.addEventListener("mousemove", this.prepTooltips);
                        plot.addEventListener("tooltipMoveEvent", this.moveTooltips.bind(this));
                        plot.addEventListener("mouseleave", this.unprepPlot);
                        plot.addEventListener("unprepPlotEvent", this.unprepAllPlots.bind(this));
                    }
                } else if(this.chartType === "line") {
                    for (var rect of svg.getElementsByClassName("chart-rect")) {
                        rect.addEventListener("mouseenter", this.createCrosshair);
                        rect.addEventListener("crosshairCreateEvent", this.createOtherCrosshairs.bind(this));
                        rect.addEventListener("mousemove", this.moveCrosshair);
                        rect.addEventListener("crosshairMoveEvent", this.moveOtherCrosshairs.bind(this));
                        rect.addEventListener("mouseleave", this.removeCrosshair);
                        rect.addEventListener("crosshairRemoveEvent", this.removeOtherCrosshairs.bind(this));
                    }
                }
                svg.addEventListener("mousedown", this.dragSelect);
                svg.addEventListener("customDragSelect", this.customDragSelect.bind(this));
                svg.addEventListener("customExpandSelect", this.customExpandSelect.bind(this));
                svg.addEventListener("customSelectPlots", this.customSelectPlots.bind(this));
            }
        }
    };
})();
