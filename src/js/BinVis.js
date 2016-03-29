var BinVis = {};

// consts
BinVis.PANEL_BYTEMAP = 0;

// controls the analysis range
BinVis.BLOCK_SIZE = 512 * 512;
BinVis.fileLoadingPhase = Globals.FILE_NOFILE;
BinVis.dataOffset = 0;
BinVis.dataLength = 0;

// Panels
BinVis.selectedPanel = null;

BinVis.panelBytemap;
BinVis.panels = [];

///////////////////////////////////////////////////////////////////
// Initializes the binvis app
// id: main-canvas = canvas to draw the UI on
///////////////////////////////////////////////////////////////////
BinVis.initialize = function () {
    FileBuffer.initialize();
    FileBuffer.onsuccess = this.loadFileSuccessHandler;
    FileBuffer.onerror = this.loadFileErrorHandler;

    UserInterface.initialize("main-canvas");
}

///////////////////////////////////////////////////////////////////
// Opens a file for analysis
///////////////////////////////////////////////////////////////////
BinVis.loadFile = function (file) {
    this.resetAllPanels();

    if (FileBuffer.file)
        FileBuffer.closeFile();

    FileBuffer.openFile(file);
    FileBuffer.asyncReadBytes();
    this.dataOffset = 0;
    this.dataLength = file.size; // file size in bytes
    console.log("Reading file...");
    Globals.FILE_LOADING;
}

///////////////////////////////////////////////////////////////////
// Handles successful file load - initialize all panels
///////////////////////////////////////////////////////////////////
BinVis.loadFileSuccessHandler = function () {
    // successful reading
    BinVis.fileLoadingPhase = Globals.FILE_LOADED;
    console.log("FILE FINISHED READING!");
    BinVis.initializePanels();
}

///////////////////////////////////////////////////////////////////
// Error loading file
///////////////////////////////////////////////////////////////////
BinVis.loadFileErrorHandler = function () {
    // error reading file
    console.log("ERROR READING!");
    BinVis.fileLoadingPhase = Globals.FILE_NOFILE;
}

///////////////////////////////////////////////////////////////////
// Setter for data offset
///////////////////////////////////////////////////////////////////
BinVis.setDataOffset = function (newOffset) {
    if (newOffset < this.dataLength && newOffset >= 0) {
        this.dataOffset = newOffset;
        this.onOffsetChanged();
    }
}

///////////////////////////////////////////////////////////////////
// Signals to all panels to paint black and stop referencing the
// array buffer
///////////////////////////////////////////////////////////////////
BinVis.resetAllPanels = function () {
    for (var i = 0; i < this.panels.length; i++) {
        this.panels[i].renderEnabled = false;
    }
}

///////////////////////////////////////////////////////////////////
// Update all panels based on current offset 
///////////////////////////////////////////////////////////////////
BinVis.onOffsetChanged = function () {
    if (this.selectedPanel) {
        this.selectedPanel.updateData();

        // force redraw
        this.selectedPanel.redraw = 1;
    }
}

///////////////////////////////////////////////////////////////////
// Signals to all panels to reference the array buffer
// Load up the default panel to be shown
///////////////////////////////////////////////////////////////////
BinVis.initializePanels = function () {

    // create the panels
    if (!this.panelBytemap) {
        this.panelBytemap = new BytemapPanel(UserInterface);
        this.panels.push(this.panelBytemap); // 0
    }

    // show the default panel
    this.showPanel(this.PANEL_BYTEMAP);
}

///////////////////////////////////////////////////////////////////
// Sets the respective panel to be displayed. All updates will also
// be routed to this panel
///////////////////////////////////////////////////////////////////
BinVis.showPanel = function (index) {
    if(this.selectedPanel)
        this.selectedPanel.renderEnabled = false;

    this.selectedPanel = this.panels[index];
    this.selectedPanel.renderEnabled = true;
    this.selectedPanel.updateData();

    // place this panel into UI
    UserInterface.panels = [];
    UserInterface.panels.push(this.selectedPanel);
}