headBase = {x: 170, y:70}
model = {
    head: {x:headBase.x, y:headBase.y},
    // TODO: angle: {value: 1.88, min: N, max: N}
    //       then I have to add the sliders using JS maybe
    //       or create them in HTML but set their min/max values using JS
    //       If I do that I'll have everything setup here
    centerMirror: {pos: {x: 200, y: 30}, angle: 1.88, width: 20, curvature: 0},
    leftMirror: {pos: {x: 140, y: 30}, angle: 1.40, width: 20, curvature: 0},
    rightMirror: {pos: {x: 310, y: 30}, angle: 2.24, width: 20, curvature: 0},
};

sanvas = document.getElementById("sdisp")

head = document.getElementById("head")

centerMirror = document.getElementById("center-mirror")
centerMirrorArea = document.getElementById("center-mirror-area")

leftMirror = document.getElementById("left-mirror")
leftMirrorArea = document.getElementById("left-mirror-area")

rightMirror = document.getElementById("right-mirror")
rightMirrorArea = document.getElementById("right-mirror-area")

centerSlider = document.getElementById("centerSlider")
centerSlider.oninput = function () {
    model.centerMirror.angle = this.value / 100.0
    updateSVGMirrors()
}

rightSlider = document.getElementById("rightSlider")
rightSlider.oninput = function () {
    model.rightMirror.angle = this.value / 100.0
    updateSVGMirrors()
}

leftSlider = document.getElementById("leftSlider")
leftSlider.oninput = function () {
    model.leftMirror.angle = this.value / 100.0
    updateSVGMirrors()
}

centerCurvatureSlider = document.getElementById("centerCurvatureSlider")
centerCurvatureSlider.oninput = function () {
    model.centerMirror.curvature = this.value / 20.0
    updateSVGMirrors()
}

rightCurvatureSlider = document.getElementById("rightCurvatureSlider")
rightCurvatureSlider.oninput = function () {
    model.rightMirror.curvature = this.value / 20.0
    updateSVGMirrors()
}

leftCurvatureSlider = document.getElementById("leftCurvatureSlider")
leftCurvatureSlider.oninput = function () {
    model.leftMirror.curvature = this.value / 20.0
    updateSVGMirrors()
}


centerWidthSlider = document.getElementById("centerWidthSlider")
centerWidthSlider.oninput = function () {
    model.centerMirror.width = this.value
    updateSVGMirrors()
}

rightWidthSlider = document.getElementById("rightWidthSlider")
rightWidthSlider.oninput = function () {
    model.rightMirror.width = this.value
    updateSVGMirrors()
}

leftWidthSlider = document.getElementById("leftWidthSlider")
leftWidthSlider.oninput = function () {
    model.leftMirror.width = this.value
    updateSVGMirrors()
}

headXOffset = document.getElementById("headXOffset")
headXOffset.oninput = function () {
    model.head.x = headBase.x + this.value / 3.0
    updateSVGHead()
    updateSVGMirrors()
}
headYOffset = document.getElementById("headYOffset")
headYOffset.oninput = function () {
    model.head.y = headBase.y + this.value / 3.0
    updateSVGHead()
    updateSVGMirrors()
}

function normal(angle) {
    return {x: Math.cos(angle), y: Math.sin(angle)}
}

function endpoints(mirror){
    c = -Math.sin(mirror.angle)
    s = Math.cos(mirror.angle)
    return {
        p0: {
            x: mirror.pos.x + c*mirror.width/2,
            y: mirror.pos.y + s*mirror.width/2
        },
        p1: {
            x: mirror.pos.x - c*mirror.width/2,
            y: mirror.pos.y - s*mirror.width/2
        }
    }
}

function updateSingleMirror(htmlMirror, htmlLine, modelMirror){
    ep = endpoints(modelMirror)
    htmlMirror.setAttribute("x1", ep.p0.x)
    htmlMirror.setAttribute("y1", ep.p0.y)
    htmlMirror.setAttribute("x2", ep.p1.x)
    htmlMirror.setAttribute("y2", ep.p1.y)

    headToMirrorCenter = {
        x: modelMirror.pos.x - model.head.x,
        y: modelMirror.pos.y - model.head.y
    }
    reflectedLine = reflectDirection(
        headToMirrorCenter,
        normal(modelMirror.angle)
    )
    const xfc = modelMirror.pos.x + 100 * reflectedLine.x
    const yfc = modelMirror.pos.y + 100 * reflectedLine.y

    headToMirrorEndpoint0 = {
        x: ep.p0.x - model.head.x,
        y: ep.p0.y - model.head.y
    }
    reflectedLine = reflectDirection(
        headToMirrorEndpoint0,
        normal(modelMirror.angle + modelMirror.curvature)
    )
    const xf0 = modelMirror.pos.x + 100 * reflectedLine.x
    const yf0 = modelMirror.pos.y + 100 * reflectedLine.y

    headToMirrorEndpoint1 = {
        x: ep.p1.x - model.head.x,
        y: ep.p1.y - model.head.y
    }
    reflectedLine = reflectDirection(
        headToMirrorEndpoint1,
        normal(modelMirror.angle - modelMirror.curvature)
    )
    const xf1 = modelMirror.pos.x + 100 * reflectedLine.x
    const yf1 = modelMirror.pos.y + 100 * reflectedLine.y
    d = `M ${model.head.x} ${model.head.y} L ${modelMirror.pos.x} ${modelMirror.pos.y} L ${xfc} ${yfc} M ${model.head.x} ${model.head.y} L ${ep.p0.x} ${ep.p0.y} L ${xf0} ${yf0} M ${model.head.x} ${model.head.y} L ${ep.p1.x} ${ep.p1.y} L ${xf1} ${yf1}`
    htmlLine.setAttribute("d", d)
}

function updateSVGMirrors(){
    updateSingleMirror(centerMirror, centerMirrorArea, model.centerMirror)
    updateSingleMirror(leftMirror, leftMirrorArea, model.leftMirror)
    updateSingleMirror(rightMirror, rightMirrorArea, model.rightMirror)
}

function updateSVGHead(){
    head.setAttribute("cx", model.head.x)
    head.setAttribute("cy", model.head.y)
}

function reflectDirection(incident, normal){
    dotProd = incident.x*normal.x + incident.y*normal.y
    proj_x = dotProd * normal.x
    proj_y = dotProd * normal.y
    return {x: incident.x - 2*proj_x, y: incident.y - 2*proj_y}
}

function initSVG(){
    updateSVGHead()
    updateSVGMirrors()
}

initSVG()
