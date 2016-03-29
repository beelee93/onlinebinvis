var FileBuffer = {};

FileBuffer.reader = null;
FileBuffer.file = null;
FileBuffer.onerror = null;
FileBuffer.onsuccess = null;

FileBuffer.data = null;

FileBuffer.initialize = function () {
    this.reader = new FileReader();
    this.reader.onloadend = this.onLoadEndHandler;
    this.reader.onerror = this.onErrorHandler;
}

FileBuffer.openFile = function (file) {
    if (!this.file)
        this.file = file;
    else
        throw new Error("A file is still opened");
}

FileBuffer.closeFile = function () {
    this.file = null;
}

FileBuffer.asyncReadBytes = function () {
    this.reader.readAsArrayBuffer(this.file);
}

FileBuffer.onErrorHandler = function (evt) {
    if (FileBuffer.onerror) FileBuffer.onerror(evt);
}

FileBuffer.onLoadEndHandler = function (evt) {
    // check ready state
    if (FileBuffer.reader.readyState == FileReader.DONE) {
        FileBuffer.data = new Uint8Array(FileBuffer.reader.result);        
        if (FileBuffer.onsuccess) FileBuffer.onsuccess();
    }
}

