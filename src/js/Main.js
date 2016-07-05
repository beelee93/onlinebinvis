$.fn.cssInt = function(prop) {
		var v = parseInt(this.css(prop), 10);
		if(isNaN(v)) {
			console.log("cssInt NOT A NUMBER!");
		}
		return v;
};

function init() {
		BinVis.initialize(); // initialize app

		// event handler for file uploader
		$("#upload-file").change(fileSelectedEvent);

		// setup event handlers for offset configurator
		$("#offset-slider").change(offset_slider_changed);

		// event handlers
		$("body").keypress(handle_keypresses)
						 .mouseup(handle_mouseup)
						 .mousemove(handle_mousemove);
						 
		document.getElementById("hex-viewer").onwheel = ScrollBar.handle_scroll;
		
		// BYTEMAP MENU
		$("#scanwidth-slider").change(scanwidth_slider_changed);
		$("#select-pixelformat").change(pixelformat_changed);
		
		// register events for ScrollBar
		ScrollBar.registerEvents();
}

// when a new file is selected
function fileSelectedEvent() {
		console.log("File selected");

		BinVis.loadFile($("#upload-file")[0].files[0]);
		var o = $("#offset-slider")[0];
		o.max = (BinVis.dataLength - 1).toString();
		o.value = "0";
		offset_slider_changed();
}

// when the button for upload is clicked
function uploadInvoke() {
		document.getElementById("upload-file").click();
}

// when offset slider is changed
function offset_slider_changed() {
		document.getElementById("offset-text").value = document.getElementById("offset-slider").value;
		var a = document.getElementById("offset-slider").value;
		var val = parseInt(a, 10);
		BinVis.setDataOffset(val);
}

function scanwidth_slider_changed() {
	  document.getElementById("scanwidth-text").value = document.getElementById("scanwidth-slider").value;
		var a = document.getElementById("scanwidth-slider").value;
		var val = parseInt(a, 10);
		
		if(BinVis.panelBytemap)
			BinVis.panelBytemap.setScanWidth(val);
}

function pixelformat_changed() {
	if(BinVis.panelBytemap)
	{
		var k = parseInt($("#select-pixelformat")[0].selectedIndex,10);
		BinVis.panelBytemap.setPixelFormat(k);
	}
}

function updateSliderFromText(name, small, large, callback) {
	var id = name+"-text";
	var id2 = name+"-slider";
	var a = document.getElementById(id).value;
	var val = parseInt(a, 10);
	if (val == NaN) {
			document.getElementById(id).value = document.getElementById(id2).value;
	}
	else {
			if (val < 0) val = 0;
			if (val > large) val = large;
			document.getElementById(id2).value = val.toString();
			callback();
  }
}

// handles keypresses globally
function handle_keypresses(evt) {

		if (!FileBuffer.file || BinVis.fileLoadingPhase != Globals.FILE_LOADED)
				return 0;

		var handled = false;
		switch (evt.target.id) {

				case "offset-text": // offset textbox
						if (evt.keyCode == 13) // ENTER
						{
								updateSliderFromText("offset", 0, BinVis.dataLength-1, offset_slider_changed);
						}
						handled = true;
						break;

				case "scanwidth-text":
						if (evt.keyCode == 13) // ENTER
						{
								updateSliderFromText("scanwidth", 0, 512, scanwidth_slider_changed);
						}
						handled = true;
						break;
				case "offset-slider": // offset slider
						offset_slider_changed();
						handled = true;
						break;
		}

		if (!handled) {
				// keypress directed to document body

				var o = $("#offset-slider")[0];
				var curVal = parseInt(o.value);
				var largeOff = Math.ceil(0.005 * BinVis.dataLength);
				
				switch (evt.keyCode) {
						case 37: // Arrow left
								evt.preventDefault();
								break;
						case 38: // Arrow up
								curVal -= (evt.ctrlKey ? largeOff : 1);
								evt.preventDefault();
								break;

						case 39: // Arrow right
								evt.preventDefault();
								break;
						case 40: // Arrow down
								curVal += (evt.ctrlKey ? largeOff : 1);
								evt.preventDefault();
								break;

						default:
								// pass key args to user interface
								if (UserInterface.onkeypress)
										UserInterface.onkeypress(evt);
								break;
				}

				// clamp
				if (curVal < 0) curVal = 0;
				if (curVal > BinVis.dataLength - 1) curVal = BinVis.dataLength - 1;

				if (curVal.toString() != o.value) {
						o.value = curVal.toString();
						offset_slider_changed();
				}
		}
}

function handle_mouseup(evt) {
	console.log("MOUSE UP");
	if(ScrollBar.scrolling) {
		ScrollBar.scrolling = false;
	}
	
	if(ScrollBar.buttonPressed) {
		ScrollBar.buttonPressed = false;
		ScrollBar.buttonDirection = 0;
	}
}

function handle_mousemove(evt) {
	if(ScrollBar.scrolling) {
		var mouse_y;
		
		if(evt.y !== undefined) {
				mouse_y = evt.y;
		}
		else {
			  mouse_y = evt.clientY + document.body.scrollTop +
              document.documentElement.scrollTop;
		}
		// move the scroll track
		ScrollBar.moveScrollTrack(mouse_y);
	}
}

// =================================
// Scroll bar mechanics
// =================================

ScrollBar = {};
ScrollBar.increment = 1; // Number of 16-byte 
ScrollBar.scrolling = false;
ScrollBar.scrollTrack =  undefined;
ScrollBar.scrollContainer = undefined;
ScrollBar.jscrollTrack = undefined;
ScrollBar.containerHeight = 0;
ScrollBar.trackHeight = 0;
ScrollBar.offsetY = 0;
ScrollBar.enabled = true;
ScrollBar.buttonPressed = false;
ScrollBar.buttonDirection = 0;

// updates the scrollbar for hexviewer to reflect loaded data length
ScrollBar.updateDimension = function() {
	if(FileBuffer.data) {
		if(FileBuffer.data.length <= 512)
		{
			// no need for scrollbar
			$("#hex-viewer-scrollbar").css("display", "none");
			ScrollBar.enabled = false;
		}
		else 
		{
			// height of scroll track
			var h = Math.max(Math.ceil(ScrollBar.containerHeight - (FileBuffer.data.length-512)/16), 10);
			ScrollBar.jscrollTrack.css("height", h.toString());
			ScrollBar.trackHeight = h;
			
			// increment for every pixel scrolled
			ScrollBar.increment = Math.max((FileBuffer.data.length - 512) / 16 / 
						(ScrollBar.containerHeight-h),1);
			ScrollBar.enabled = true;
		}
		
		// reset top
		ScrollBar.scrollTrack.style.top="16px";
	}
	else {
		$("#hex-viewer-scrollbar").css("display", "none");
			ScrollBar.enabled = false;
	}
};

// attach mouse events
ScrollBar.registerEvents = function() {
	ScrollBar.scrollTrack =  document.getElementById("scroll-track");
	ScrollBar.scrollContainer = document.getElementById("hex-viewer-scrollbar");
	ScrollBar.jscrollTrack = $("#scroll-track");
	ScrollBar.containerHeight = ScrollBar.scrollContainer.offsetHeight-32;
	ScrollBar.trackHeight = ScrollBar.scrollTrack.offsetHeight;
	
	ScrollBar.jscrollTrack.mousedown(this.mouseDown);
	
	// scroll buttons
	$("#scroll-up").mousedown(ScrollBar.buttonMouseDown);
	$("#scroll-bottom").mousedown(ScrollBar.buttonMouseDown);
};

// mouse down on track
ScrollBar.mouseDown = function(evt) {
	if(!ScrollBar.enabled) return 0;
	
	ScrollBar.scrolling = true;
	evt.preventDefault();
	
	if(evt.y !== undefined) {
		ScrollBar.offsetY = evt.y - ScrollBar.scrollTrack.getBoundingClientRect().top - 
			document.documentElement.scrollTop;
	} else {
		ScrollBar.offsetY = evt.clientY - ScrollBar.scrollTrack.getBoundingClientRect().top;
	}
};

// mouse down on either buttons
ScrollBar.buttonMouseDown = function(evt) {
	if(!ScrollBar.enabled) return 0;
	
	if(!ScrollBar.buttonPressed) {
		ScrollBar.buttonPressed = true;
	} else return 0;
	
	if(evt.target.id=="scroll-up") {
		ScrollBar.buttonDirection = -1;
	} else if(evt.target.id=="scroll-bottom"){
		ScrollBar.buttonDirection = 1;
	} else {
		console.log("ScrollBar.buttonMouseDown():Invalid target for mouse up");
		ScrollBar.buttonPressed = false;
		return 0;
	}
	
	ScrollBar.scrollByAmount(ScrollBar.buttonDirection);
	window.setTimeout(ScrollBar.buttonScroll, 200);
}

ScrollBar.buttonScroll = function() {
	// continue scrolling if mouse is not up
	if(ScrollBar.buttonPressed) {
		ScrollBar.scrollByAmount(ScrollBar.buttonDirection);
		window.setTimeout(ScrollBar.buttonScroll, 1);
	}	
}

// when scroll offset is changed
ScrollBar.onScrollChanged = function() {
	if(!ScrollBar.enabled) return 0;
	
	var curScroll = (ScrollBar.jscrollTrack.cssInt("top") - 16);
	
	// TODO: Need to incorporate the increment here!!
	var offset = Math.floor(curScroll * ScrollBar.increment * 16);
	BinVis.updateHexViewer(offset);
	
	BinVis.highlightHex(-1);
};


// when the track is dragged
ScrollBar.moveScrollTrack = function(mouse_y) {
	if(!ScrollBar.enabled) return 0;
	
	var o = ScrollBar.scrollTrack;
	var origTop = ScrollBar.scrollContainer.getBoundingClientRect().top+
		document.documentElement.scrollTop+16;
	
	var prevScrollTop = ScrollBar.jscrollTrack.cssInt("top");
	
	mouse_y -= ScrollBar.offsetY;
	if(mouse_y < origTop) {
		mouse_y = origTop;
		ScrollBar.setButtonEnabled(ScrollBar.SCROLL_UP, false);
		ScrollBar.setButtonEnabled(ScrollBar.SCROLL_DOWN, true);
	}
	else if(mouse_y > origTop + ScrollBar.containerHeight-ScrollBar.trackHeight) {
		mouse_y = origTop + ScrollBar.containerHeight-ScrollBar.trackHeight;
		ScrollBar.setButtonEnabled(ScrollBar.SCROLL_UP, true);
		ScrollBar.setButtonEnabled(ScrollBar.SCROLL_DOWN, false);
	} else {
		ScrollBar.setButtonEnabled(ScrollBar.SCROLL_UP, true);
		ScrollBar.setButtonEnabled(ScrollBar.SCROLL_DOWN, true);
	}
	
	var currScrollTop = mouse_y-origTop+16;
	o.style.top = (mouse_y-origTop+16) + "px";
	
	if(prevScrollTop != currScrollTop){
		ScrollBar.onScrollChanged();
	}
};

// sets the state of the buttons
ScrollBar.SCROLL_UP = 0;
ScrollBar.SCROLL_DOWN = 1;
ScrollBar.setButtonEnabled = function(which, enabled) {
	var name;
	if(which == ScrollBar.SCROLL_UP) 
		name = "#scroll-up";
	else if(which == ScrollBar.SCROLL_DOWN)
		name = "#scroll-bottom"
	else {
		console.log("Error at ScrollBar.setButtonEnabled")
		return 0;
	}
	
	if(enabled)
		$(name).addClass("enabled").removeClass("disabled");
	else
		$(name).addClass("disabled").removeClass("enabled");
};

// wheel scroll on hex-viewer div
ScrollBar.handle_scroll = function(evt) {
	if(!ScrollBar.enabled) return 0;
	ScrollBar.scrollByAmount(evt.deltaY);
	evt.preventDefault();
};

// scroll the track by specified amount
ScrollBar.scrollByAmount = function(amt) {
	var dy = amt;
	
	var prevScrollTop = ScrollBar.jscrollTrack.cssInt("top");
	var newScroll = prevScrollTop + dy;
	if(newScroll < 16) {
		newScroll = 16;
		ScrollBar.setButtonEnabled(ScrollBar.SCROLL_UP, false);
		ScrollBar.setButtonEnabled(ScrollBar.SCROLL_DOWN, true);
	}
	else if(newScroll > 16+ScrollBar.containerHeight-ScrollBar.trackHeight) {
		newScroll = 16+ScrollBar.containerHeight-ScrollBar.trackHeight;
		ScrollBar.setButtonEnabled(ScrollBar.SCROLL_UP, true);
		ScrollBar.setButtonEnabled(ScrollBar.SCROLL_DOWN, false);
	}
	else{
		ScrollBar.setButtonEnabled(ScrollBar.SCROLL_UP, true);
		ScrollBar.setButtonEnabled(ScrollBar.SCROLL_DOWN, true);
	}
	
	ScrollBar.scrollTrack.style.top = newScroll + "px";
	ScrollBar.onScrollChanged();
};

// update the tracks location based on the first line's offset
ScrollBar.updateTrackPosition = function() {
	var offset = parseInt($("#offset-0").text(),16);
	var top = Math.floor(offset / ScrollBar.increment / 16);
	if(top<=0) {
		top = 0;
		ScrollBar.setButtonEnabled(ScrollBar.SCROLL_UP, false);
		ScrollBar.setButtonEnabled(ScrollBar.SCROLL_DOWN, true);
	}
	else if(top + ScrollBar.trackHeight > ScrollBar.containerHeight) {
		top = ScrollBar.containerHeight - ScrollBar.trackHeight;
		ScrollBar.setButtonEnabled(ScrollBar.SCROLL_UP, true);
		ScrollBar.setButtonEnabled(ScrollBar.SCROLL_DOWN, false);
	} else {
		ScrollBar.setButtonEnabled(ScrollBar.SCROLL_UP, true);
		ScrollBar.setButtonEnabled(ScrollBar.SCROLL_DOWN, true);
	}
	ScrollBar.scrollTrack.style.top = (top + 16) + "px";
};