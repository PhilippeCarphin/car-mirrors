headBase = {x: 70, y:70}
model = {
    head: {x:headBase.x, y:headBase.y},
    // TODO: angle: {value: 1.88, min: N, max: N}
    //       then I have to add the sliders using JS maybe
    //       or create them in HTML but set their min/max values using JS
    //       If I do that I'll have everything setup here
    centerMirror: {pos: {x: 100, y: 30}, angle: 1.88, width: 20, curvature: 0},
    leftMirror: {pos: {x: 40, y: 30}, angle: 1.40, width: 20, curvature: 0},
    rightMirror: {pos: {x: 210, y: 30}, angle: 2.24, width: 20, curvature: 0},
};


canvas = document.getElementById("disp")

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
    draw()
}

rightSlider = document.getElementById("rightSlider")
rightSlider.oninput = function () {
    model.rightMirror.angle = this.value / 100.0
    updateSVGMirrors()
    draw()
}

leftSlider = document.getElementById("leftSlider")
leftSlider.oninput = function () {
    model.leftMirror.angle = this.value / 100.0
    updateSVGMirrors()
    draw()
}

centerCurvatureSlider = document.getElementById("centerCurvatureSlider")
centerCurvatureSlider.oninput = function () {
    model.centerMirror.curvature = this.value / 20.0
    updateSVGMirrors()
    draw()
}

rightCurvatureSlider = document.getElementById("rightCurvatureSlider")
rightCurvatureSlider.oninput = function () {
    model.rightMirror.curvature = this.value / 20.0
    updateSVGMirrors()
    draw()
}

leftCurvatureSlider = document.getElementById("leftCurvatureSlider")
leftCurvatureSlider.oninput = function () {
    model.leftMirror.curvature = this.value / 20.0
    updateSVGMirrors()
    draw()
}


centerWidthSlider = document.getElementById("centerWidthSlider")
centerWidthSlider.oninput = function () {
    model.centerMirror.width = this.value
    updateSVGMirrors()
    draw()
}

rightWidthSlider = document.getElementById("rightWidthSlider")
rightWidthSlider.oninput = function () {
    model.rightMirror.width = this.value
    updateSVGMirrors()
    draw()
}

leftWidthSlider = document.getElementById("leftWidthSlider")
leftWidthSlider.oninput = function () {
    model.leftMirror.width = this.value
    updateSVGMirrors()
    draw()
}

headXOffset = document.getElementById("headXOffset")
headXOffset.oninput = function () {
    model.head.x = headBase.x + this.value / 3.0
    updateSVGHead()
    updateSVGMirrors()
    draw() // Not necessary for SVG
}
headYOffset = document.getElementById("headYOffset")
headYOffset.oninput = function () {
    model.head.y = headBase.y + this.value / 3.0
    updateSVGHead()
    updateSVGMirrors()
    draw() // Not necessary for SVG
}
ctx = canvas.getContext("2d")

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

// Draw a mirror as an arc segment.  In drawMirrorArea, I simulate being curved
// by reflecting the lines at the edges along a normal that is adjusted as if
// the mirror was curved  I defined 'mirror.curvature' as an angle offset from
// 'mirror.angle' property.
//
// In this function, I use mirror.curvature as 1/radius: Indeed, a curvature of
// 0 makes the mirror a straight line and a more curved mirror means a smaller
// radius.
// With radius being 1/mirror.curvature, we need to find the center of the arc
// so that the circle is tangent to the original straight line of the mirror.
//
// I'm putting that on hold for now because anyway, the curvature of a real
// mirror is imperceptible except for the change in the reflected area which
// I am modelling in a much simpler way having the normal at the edges be
// slightly offset form the normal in the center.
function drawArcMirror(mirror){
    N = normal(mirror.angle)
    mirrorCenter = {
        x: mirror.pos.x - 1/mirror.curvature * N.x,
        y: mirror.pos.y - 1/mirror.curvature * N.y,
    }
    mirrorSweepAngle = mirror.width * mirror.curvature
    ctx.beginPath()
    ctx.arc(
        mirrorCenter.x,
        mirrorCenter.y,
        1/mirror.curvature,
        Math.PI/2 + mirror.angle - mirrorSweepAngle/2,
        Math.PI/2 + mirror.angle + mirrorSweepAngle/2
    )
    ctx.fillStyle = "blue"
    ctx.fill()
}

// Function used for drawing a mirror as an arc segment: this function finds
// the center of the circle used for this arc segment.
function getMirrorCenter(mirror){
    N = normal(mirror.angle)
    return {
        x: mirror.pos.x - 1/mirror.curvature * N.x,
        y: mirror.pos.y - 1/mirror.curvature * N.y,
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

function drawMirror(mirror){
    ep = endpoints(mirror)
    drawLineSegment(ep.p0, ep.p1, "green", 3)
    ctx.beginPath()
    ctx.arc(ep.p0.x, ep.p0.y, 5, 0, 2*Math.PI)
    ctx.arc(ep.p1.x, ep.p1.y, 5, 0, 2*Math.PI)
    ctx.fillStyle = "red"
    ctx.fill()
}

function updateSVGHead(){
    head.setAttribute("cx", model.head.x)
    head.setAttribute("cy", model.head.y)
}

function drawHead(){
    ctx.beginPath()
    ctx.arc(model.head.x, model.head.y, 8, 0, 2*Math.PI)
    ctx.fillStyle = "blue"
    ctx.fill()
}

function drawMirrorArea(head, mirror, color) {
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.strokeStyle = "black"
    ctx.moveTo(head.x, head.y)
    ctx.lineTo(mirror.pos.x, mirror.pos.y)
    VC = {x: mirror.pos.x - head.x, y: mirror.pos.y - head.y}
    RC = reflectDirection(VC, normal(mirror.angle))
    ctx.lineTo(mirror.pos.x + 4*RC.x, mirror.pos.y + 4*RC.y)
    ctx.stroke()

    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ep = endpoints(mirror)
    ctx.moveTo(head.x, head.y)
    ctx.lineTo(ep.p0.x, ep.p0.y)
    V0 = {x: ep.p0.x - head.x, y: ep.p0.y - head.y}
    R0 = reflectDirection(V0, normal(mirror.angle + mirror.curvature))
    ctx.lineTo(ep.p0.x + 4*R0.x, ep.p0.y + 4* R0.y)

    ctx.moveTo(head.x, head.y)
    ctx.lineTo(ep.p1.x, ep.p1.y)
    V1 = {x: ep.p1.x - head.x, y: ep.p1.y - head.y}
    R1 = reflectDirection(V1, normal(mirror.angle - mirror.curvature))
    ctx.lineTo(ep.p1.x + 4*R1.x, ep.p1.y + 4* R1.y)

    ctx.stroke()
}

function reflectDirection(incident, normal){
    dotProd = incident.x*normal.x + incident.y*normal.y
    proj_x = dotProd * normal.x
    proj_y = dotProd * normal.y
    return {x: incident.x - 2*proj_x, y: incident.y - 2*proj_y}
}

function drawLineSegment(p0, p1, color, width){
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.beginPath()
    ctx.moveTo(p0.x, p0.y)
    ctx.lineTo(p1.x, p1.y)
    ctx.stroke()
}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawHead()
    drawMirror(model.leftMirror)
    drawMirror(model.rightMirror)
    drawMirror(model.centerMirror)
    drawMirrorArea(model.head, model.centerMirror, "orange")
    drawMirrorArea(model.head, model.leftMirror, "brown")
    drawMirrorArea(model.head, model.rightMirror, "brown")
}

function initSVG(){
    updateSVGHead()
    updateSVGMirrors()
}
initSVG()
draw()
