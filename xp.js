const base = Module.findBaseAddress('libg.so');

// Provided NativeFunctions
const malloc = new NativeFunction(Module.getExportByName('libc.so', 'malloc'), 'pointer', ['uint']);
const StringTable_getMovieClip = new NativeFunction(base.add(0xA70848), 'pointer', ['pointer', 'pointer']);
const stringctor = new NativeFunction(base.add(0xC44060), 'pointer', ['pointer', 'pointer']);
const stageInstance = base.add(0x10A0500).readPointer();
const Stage_addChild = new NativeFunction(base.add(0xAB6D6C), 'pointer', ['pointer', 'pointer']);
const TextField_setText = new NativeFunction(base.add(0x4D1FD4), 'pointer', ['pointer', 'pointer', 'bool']);
const GameButton_GameButton = new NativeFunction(base.add(0x4D1968), 'void', ['pointer']);
const ResourceListener_addFile = new NativeFunction(base.add(0xB0905C), 'void', ['pointer', 'pointer', 'pointer']);
const dropGUIContainer_DropGUIContainer = base.add(0x4D2D78);
const movieClipsettext = new NativeFunction(base.add(0xACFC50), 'void', ['pointer', 'pointer', 'pointer']);
const Sprite_Sprite = new NativeFunction(base.add(0xAADA14), 'void', ['pointer', 'int']);
const gotoAndStop = new NativeFunction(base.add(0xA9D26C), 'void', ['pointer', 'int']);
const MovieClip_getTextFieldByName = new NativeFunction(base.add(0xA9E2B4), 'pointer', ['pointer', 'pointer']);
const DecoratedTextField_setupDecoratedText = new NativeFunction(base.add(0x4C847C), 'void', ['pointer', 'pointer', 'pointer']);
const LogicDataTables_getColorGradientByName = new NativeFunction(base.add(0x8F3340), 'pointer', ['pointer', 'int']);
const MovieClipHelper_setTextAndScaleIfNecessary = new NativeFunction(base.add(0x860A34), 'void', ['pointer', 'pointer', 'int', 'int']);
const DisplayObject_setPixelSnappedXY = new NativeFunction(base.add(0xA987F4), 'pointer', ['pointer', 'float', 'float']);

// Utility functions (from load)
function getStrPtr(str) {
    return Memory.allocUtf8String(str);
}

function getScPtr(str) {
    var pointer = malloc(40);
    stringctor(pointer, getStrPtr(str));
    return pointer;
}

function showObject(ptr1, x = 0, y = 0) {
    if (ptr1) {
        DisplayObject_setPixelSnappedXY(ptr1, x, y);
        ptr1.add(78).writeU8(1);
    } else {
        console.log("Error: Null pointer in showObject");
    }
}

function hideObject(ptr1) {
    if (ptr1) {
        try {
            ptr1.add(78).writeU8(0);
            DisplayObject_setPixelSnappedXY(ptr1, 9999, 9999);
        } catch {}
    }
}

// Track Brawl TV button state
let brawlTvButton = null;
let isBrawlTvVisible = false;
let loopInterval = null;

// Create Brawl TV button using MovieClip
function createBrawlTvButton() {
    if (brawlTvButton) {
        console.log("Brawl TV button already exists");
        return;
    }

    brawlTvButton = malloc(544);
    GameButton_GameButton(brawlTvButton);

    // Load MovieClip (try "popup_brawltv" from sc/ui.sc, fallback to debug_menu_item)
    const clip = StringTable_getMovieClip(getStrPtr("sc/ui.sc"), getStrPtr("popup_brawltv"));
    if (clip.isNull()) {
        console.log("Warning: popup_brawltv not found, using debug_menu_item");
        StringTable_getMovieClip(getStrPtr("sc/debug.sc"), getStrPtr("debug_menu_item"));
    }
    gotoAndStop(clip, 1);

    // Initialize button with MovieClip
    const initFn = new NativeFunction(brawlTvButton.readPointer().add(352).readPointer(), 'void', ['pointer', 'pointer', 'bool']);
    initFn(brawlTvButton, clip, true);

    // Set button text
    const textField = MovieClip_getTextFieldByName(clip, getStrPtr("Text"));
    if (!textField.isNull()) {
        const gradient = LogicDataTables_getColorGradientByName(getScPtr("Name11"), 1);
        MovieClipHelper_setTextAndScaleIfNecessary(textField, getScPtr("Brawl TV"), 1, 0);
        DecoratedTextField_setupDecoratedText(textField, getScPtr("Brawl TV"), gradient);
    } else {
        TextField_setText(brawlTvButton, getScPtr("Brawl TV"), true);
    }

    // Set position and scale
    DisplayObject_setPixelSnappedXY(brawlTvButton, 579.7, 287);
    brawlTvButton.add(16).writeFloat(0.9); // height
    brawlTvButton.add(28).writeFloat(0.9); // width

    // Add to stage
    Stage_addChild(stageInstance, brawlTvButton);
    isBrawlTvVisible = true;
    console.log("Brawl TV button created at position (579.7, 287)");
}

// Function to ensure Brawl TV button is shown (looping logic)
function showBrawlTv() {
    try {
        if (!brawlTvButton) {
            createBrawlTvButton();
        } else if (!isBrawlTvVisible) {
            showObject(brawlTvButton, 579.7, 287);
            isBrawlTvVisible = true;
            console.log("Brawl TV button shown");
        } else {
            console.log("Brawl TV button already visible");
        }
    } catch (e) {
        console.error("Error in showBrawlTv: " + e);
    }
}

// Hook ResourceListener to ensure sc/ui.sc or sc/debug.sc is loaded
const addFileAttach = Interceptor.attach(ResourceListener_addFile, {
    onEnter(args) {
        const fileName = args[1].readPointer().readUtf8String();
        if (fileName === "sc/ui.sc" || fileName === "sc/debug.sc") {
            console.log(`${fileName} loaded, creating Brawl TV button`);
            setTimeout(createBrawlTvButton, 250);
            addFileAttach.detach();
        }
    }
});

// Main looping function
function brawlTvLoop() {
    showBrawlTv();
}

// Start the loop (every 3 seconds)
if (loopInterval) clearInterval(loopInterval);
loopInterval = setInterval(brawlTvLoop, 3000);

// Initial call
brawlTvLoop();