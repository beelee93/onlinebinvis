var Globals = {
    ANCHOR_NONE: 0,
    ANCHOR_LEFT: 1,
    ANCHOR_TOP: 2,
    ANCHOR_RIGHT: 4,
    ANCHOR_BOTTOM: 8,

    FILE_NOFILE: 0,
    FILE_LOADING: 1,
    FILE_LOADED: 2,

    SupportedPixelFormatCount : 6,
    PF8BPP : 0,
    PF16BPP : 1,
    PF24BPP_RGB : 2,
    PF24BPP_BGR : 3,
    PF32BPP_ARGB : 4,
    PF32BPP_BGRA : 5,

    superConstructor: function (context, parent,args) {
        parent.prototype.constructor.apply(context, args);
    },

    inherits: function (child, base) {
        var childCon = child.prototype.constructor;
        child.prototype = Object.create(base.prototype);
        child.prototype.constructor = childCon;
    }
}