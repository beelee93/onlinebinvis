///////////////////////////////////////////////////////////////////
// constructor
///////////////////////////////////////////////////////////////////
function VisualPanel(parent) {
    this.assignParent(parent);
}
 
///////////////////////////////////////////////////////////////////
// Attributes
///////////////////////////////////////////////////////////////////
VisualPanel.prototype.size = { 
        width: 0,
        height: 0
    };

VisualPanel.prototype.position = {
        x : 0,
        y : 0
    }

VisualPanel.prototype.anchorMargin = {
        left : -1,
        top :-1,
        right : -1,
        bottom : -1
    }

VisualPanel.prototype.anchor = Globals.ANCHOR_NONE;
VisualPanel.prototype.name = "UserControl";
VisualPanel.prototype.parent = null;
VisualPanel.prototype.renderEnabled = false;

///////////////////////////////////////////////////////////////////
// Assigns this panel to a UserInterface
///////////////////////////////////////////////////////////////////
VisualPanel.prototype.assignParent = function (parent) {
    this.parent = parent;
    parent.panels.push(this);
}

///////////////////////////////////////////////////////////////////
// anchor the edges of this control to the parent dimensions
///////////////////////////////////////////////////////////////////
VisualPanel.prototype.setAnchor = function (anchorFlags) {
    if (!this.parent)
        throw new Error(this.name + " - Attempted to set anchor to null parent.");

    this.anchor = anchorFlags;

    this.anchorMargin.left = -1;
    this.anchorMargin.top = -1;
    this.anchorMargin.right = -1;
    this.anchorMargin.bottom = -1;

    if (anchorFlags & Globals.ANCHOR_LEFT)
        this.anchorMargin.left = this.position.x;
    if (anchorFlags & Globals.ANCHOR_TOP)
        this.anchorMargin.top = this.position.y;
    if (anchorFlags & Globals.ANCHOR_RIGHT)
        this.anchorMargin.right = this.parent.width - this.position.x - this.size.width;
    if (anchorFlags & Globals.ANCHOR_BOTTOM)
        this.anchorMargin.bottom = this.parent.height - this.position.y - this.size.height;
}

///////////////////////////////////////////////////////////////////
// updates dimensions of this control based on the anchors
///////////////////////////////////////////////////////////////////
VisualPanel.prototype.relayout = function () {
    if (!this.anchor || !this.parent)
        return;

    if (this.anchor & Globals.ANCHOR_LEFT)
        this.position.x = this.anchorMargin.left;
    if (this.anchor & Globals.ANCHOR_RIGHT) {
        if (this.anchor & Globals.ANCHOR_LEFT) {
            this.size.width = this.parent.width - this.position.x - this.anchorMargin.right;
            if (this.size.width < 1) this.size.width = 1;
        }
        else {
            this.position.x = this.parent.width - this.anchorMargin.right - this.size.width;
        }
    }

    if (this.anchor & Globals.ANCHOR_TOP)
        this.position.y = this.anchorMargin.top;
    if (this.anchor & Globals.ANCHOR_BOTTOM) {
        if (this.anchor & Globals.ANCHOR_TOP) {
            this.size.height = this.parent.height - this.position.y - this.anchorMargin.bottom;
            if (this.size.height < 1) this.size.height = 1;
        }
        else {
            this.position.y = this.parent.height - this.anchorMargin.bottom - this.size.height;
        }
    }
}

///////////////////////////////////////////////////////////////////
// main rendering function to be overriden
///////////////////////////////////////////////////////////////////
VisualPanel.prototype.render = function (context, elapsed) { }

///////////////////////////////////////////////////////////////////
// main update function
///////////////////////////////////////////////////////////////////
VisualPanel.prototype.update = function (elapsed) { }

///////////////////////////////////////////////////////////////////
// invoked when the analysis data is changed
///////////////////////////////////////////////////////////////////
VisualPanel.prototype.updateData = function () { }