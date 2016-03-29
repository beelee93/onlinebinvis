var UserInterface = {};
UserInterface.initialize = function (canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext("2d");
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.prevTime = -1;

    this.panels = []; // collection of VisualPanels

    // request the frame
    window.requestAnimationFrame(this.requestAnimHandler);
}

UserInterface.requestAnimHandler = function (timeStamp) {
    // set invoking object reference to self
    UserInterface.render.call(UserInterface, timeStamp);
}

UserInterface.render = function (timeStamp) {
    var ctx = this.context;
    var i;
    var diffTime = timeStamp - this.prevTime;
    diffTime /= 1000.0;

    // clear canvas
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, this.width, this.height);

    if (this.prevTime < 0) {
        // first update

    }
    else {
        // render all user control
        for (i = 0; i < this.panels.length; i++) {
            if (this.panels[i].renderEnabled) {
                this.panels[i].update(diffTime);
                this.panels[i].render(ctx, diffTime);
            }
        }
    }

    // save current time
    this.prevTime = timeStamp;

    // request for next frame
    window.requestAnimationFrame(this.requestAnimHandler);

    // reflect dimensions to own attributes
    this.width = this.canvas.width;
    this.height = this.canvas.height;
}


UserInterface.relayout = function () {
    for (var i = 0; i < this.panels.length; i++) {
        this.panels[i].relayout();
    }
}


UserInterface.onkeypress = function (evt) {
    // pass arguments down to each panel
    for (var i = 0; i < UserInterface.panels.length; i++) {
        UserInterface.panels[i].onkeypress(evt);
    }
}