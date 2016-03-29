var Globals = {
    ANCHOR_NONE: 0,
    ANCHOR_LEFT: 1,
    ANCHOR_TOP: 2,
    ANCHOR_RIGHT: 4,
    ANCHOR_BOTTOM: 8,

    FILE_NOFILE: 0,
    FILE_LOADING: 1,
    FILE_LOADED: 2,


    superConstructor: function (context, parent,args) {
        parent.prototype.constructor.apply(context, args);
    },

    inherits: function (child, base) {
        var childCon = child.prototype.constructor;
        child.prototype = Object.create(base.prototype);
        child.prototype.constructor = childCon;
    }
}