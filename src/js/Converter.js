// Extended ASCII conversion

var Converter = {};

Converter._table = new Array(256);

// Create the conversion table
for (var i = 0; i < 256; i++) {
    var exc = [127, 129, 141, 143, 144, 157, 160, 173];
    if ((i >= 32 && i<128) || ( i>161 ) && exc.indexOf(i)<0)
        Converter._table[i] = String.fromCharCode(i);
    else
        Converter._table[i] = ".";
}

Converter.getPrintable = function (byte) {
    if (byte < 0) return "."
    else if (byte > 255) return "."
    else
        return Converter._table[byte];
}