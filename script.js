function load() {
    const base = Module.findBaseAddress('libg.so');
    const libgSize = Process.findModuleByName("libg.so").size;
    Memory.protect(base, libgSize, "rwx");

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

    const OFFSETS = {
        JOYSTICK_FUNC_OFFSET: 0x6F82C4,
        OFFSET_JOYSTICK_CURRENT_X: 0x91C,
        OFFSET_JOYSTICK_CENTER_X: 0x920,
        OFFSET_JOYSTICK_CURRENT_Y: 0x918,
        OFFSET_JOYSTICK_CENTER_Y: 0x924
    };

    const JOYSTICK_RADIUS = 80.0;

    var xPtr = 32;
    var yPtr = 36;
    var heightPtr = 16;
    var widthPtr = 28;

    function getXY(ptr1) {
        return {x: ptr1.add(xPtr).readFloat(), y: ptr1.add(yPtr).readFloat()};
    }

    function setXY(ptr1, x, y) {
        ptr1.add(xPtr).writeFloat(x);
        ptr1.add(yPtr).writeFloat(y);
    }

    function getHeightWidth(ptr1) {
        return {height: ptr1.add(heightPtr).readFloat(), width: ptr1.add(widthPtr).readFloat()};
    }

    function setHeightWidth(ptr1, height, width) {
        ptr1.add(heightPtr).writeFloat(height);
        ptr1.add(widthPtr).writeFloat(width);
    }

    function hideObject(ptr1) {
        if (ptr1) {
            try {
                ptr1.add(78).writeU8(0);
                setXY(ptr1, 9999, 9999);
            } catch {};
        }
    }

    function showObject(ptr1, x=0, y=0) {
        if (ptr1) {
            DisplayObject_setPixelSnappedXY(ptr1, x, y);
            ptr1.add(78).writeU8(1);
        } else {
            console.log("err");
        }
    }

    function getStrPtr(str) {
        return Memory.allocUtf8String(str);
    }

    function getScPtr(str) {
        var pointer = malloc(40);
        stringctor(pointer, getStrPtr(str));
        return pointer;
    }

    function ReadStringFromStringObject(StrObjectPtr) {
        const StringByteLength = StrObjectPtr.add(4).readInt();
        if (StringByteLength > 7) {
            return StrObjectPtr.add(8).readPointer().readUtf8String(StringByteLength);
        }
        return StrObjectPtr.add(8).readUtf8String(StringByteLength);
    }

    function showFloater(text) {
        const Gui_getInstance = new NativeFunction(base.add(0x4CB5F8), 'pointer', []);
        const Gui_showFloaterTextAtDefaultPos = new NativeFunction(base.add(0x705034), 'void', ['pointer', 'pointer', 'int', 'int']);
        Gui_showFloaterTextAtDefaultPos(Gui_getInstance(), getScPtr(text), 0, -1);
    }

    var blueButton = null;
    var greenButton = null;
    var brawlTvButton = null;
    var blueButtonVisible = false;
    var greenButtonVisible = false;
    var brawlTvButtonVisible = false;

    var state = {
        dodgeActive: true,
        aimbotActive: false,
        spinActive: false,
        spinSpeed: 0.45,
        spinRadius: 100,
        spinAngle: 0,
        autoDodgeButton: null,
        aimbotButton: null,
        spinButton: null
    };

    function createBlueButton() {
        if (blueButton) return;

        blueButton = malloc(544);
        GameButton_GameButton(blueButton);

        const clip = StringTable_getMovieClip(getStrPtr("sc/ui.sc"), getStrPtr("country_item"));
        gotoAndStop(clip, 1);

        const initFn = new NativeFunction(blueButton.readPointer().add(352).readPointer(), 'void', ['pointer', 'pointer', 'bool']);
        initFn(blueButton, clip, 1);

        TextField_setText(blueButton, getScPtr("Blue Button"), 1);
        setXY(blueButton, 579.7, 287);
        setHeightWidth(blueButton, 0.9, 0.9);
        Stage_addChild(stageInstance, blueButton);
        blueButtonVisible = true;
    }

    function createGreenButton() {
        if (greenButton) return;

        greenButton = malloc(544);
        GameButton_GameButton(greenButton);

        const clip = StringTable_getMovieClip(getStrPtr("sc/ui.sc"), getStrPtr("country_item"));
        gotoAndStop(clip, 2);

        const initFn = new NativeFunction(greenButton.readPointer().add(352).readPointer(), 'void', ['pointer', 'pointer', 'bool']);
        initFn(greenButton, clip, 1);

        TextField_setText(greenButton, getScPtr("Green Button"), 1);
        setXY(greenButton, 200, 520);
        setHeightWidth(greenButton, 1, 1);
        Stage_addChild(stageInstance, greenButton);
        greenButtonVisible = true;
    }

    function createBrawlTvButton() {
        if (brawlTvButton) return;

        brawlTvButton = malloc(544);
        GameButton_GameButton(brawlTvButton);

        const clip = StringTable_getMovieClip(getStrPtr("sc/ui.sc"), getStrPtr("popup_brawltv"));
        gotoAndStop(clip, 1);

        const initFn = new NativeFunction(brawlTvButton.readPointer().add(352).readPointer(), 'void', ['pointer', 'pointer', 'bool']);
        initFn(brawlTvButton, clip, 1);

        TextField_setText(brawlTvButton, getScPtr("Brawl TV"), 1);
        setXY(brawlTvButton, 579.7, 287);
        setHeightWidth(brawlTvButton, 1, 1);
        Stage_addChild(stageInstance, brawlTvButton);
        brawlTvButtonVisible = true;
    }

    function toggleBlueButton() {
        if (!blueButton) {
            createBlueButton();
            state.blueButtonActive = true;
            showFloater("Blue Button enabled");
        } else {
            state.blueButtonActive = !state.blueButtonActive;
            if (blueButtonVisible) {
                hideObject(blueButton);
                blueButtonVisible = false;
                showFloater("Blue Button disabled");
            } else {
                showObject(blueButton, 579.7, 287);
                blueButtonVisible = true;
                showFloater("Blue Button enabled");
            }
        }
    }

    function toggleGreenButton() {
        if (!greenButton) {
            createGreenButton();
            state.greenButtonActive = true;
            showFloater("Green Button enabled");
        } else {
            state.greenButtonActive = !state.greenButtonActive;
            if (greenButtonVisible) {
                hideObject(greenButton);
                greenButtonVisible = false;
                showFloater("Green Button disabled");
            } else {
                showObject(greenButton, 200, 520);
                greenButtonVisible = true;
                showFloater("Green Button enabled");
            }
        }
    }

    function toggleBrawlTvButton() {
        if (!brawlTvButton) {
            createBrawlTvButton();
            state.brawlTvButtonActive = true;
            showFloater("Brawl TV enabled");
        } else {
            state.brawlTvButtonActive = !state.brawlTvButtonActive;
            if (brawlTvButtonVisible) {
                hideObject(brawlTvButton);
                brawlTvButtonVisible = false;
                showFloater("Brawl TV disabled");
            } else {
                showObject(brawlTvButton, 579.7, 287);
                brawlTvButtonVisible = true;
                showFloater("Brawl TV enabled");
            }
        }
    }

    var addfileattach = Interceptor.attach(ResourceListener_addFile, {
        onEnter(args) {
            if (ReadStringFromStringObject(args[1]) == "sc/debug.sc") {
                addfileattach.detach();
                console.log("sc/debug.sc loaded!");
            }
            ResourceListener_addFile(args[0], getScPtr("sc/debug.sc"), args[2]);
            setTimeout(createDButton, 250);
            addfileattach.detach();
            console.log("sc/debug.sc loaded!");
        }
    });

    var debugButtons = [];
    var debugCategorys = [];
    var isDebugOpened = false;
    var openedCatName = "";

    const debugMenuBase = {
        init(instance, sc="sc/debug.sc", exportname="debug_menu") {
            new NativeFunction(Sprite_Sprite, 'void', ['pointer', 'int'])(instance, 1);
            var movieClip = StringTable_getMovieClip(getStrPtr(sc), getStrPtr(exportname));
            new NativeFunction(dropGUIContainer_DropGUIContainer, 'void', [
                'pointer',
                'pointer'
            ])(instance, movieClip);
            
            let textField = MovieClip_getTextFieldByName(movieClip, getStrPtr("title"));
            let gradient = LogicDataTables_getColorGradientByName(getScPtr("WasabiExtraHot"), 1);
            DecoratedTextField_setupDecoratedText(textField, getScPtr(""), gradient);
            
            setHeightWidth(instance, 0.735, 0.8);

            DisplayObject_setPixelSnappedXY(instance, 0, 0);

            hideObject(instance);

            Stage_addChild(stageInstance, instance);
        },
        setTitle(instance, title) {
            new NativeFunction(movieClipsettext, 'void', ['pointer', 'pointer', 'pointer'])(instance, getStrPtr("title"), getScPtr(title));
        },
        createCategory(name) {
            var instance = malloc(544);
            GameButton_GameButton(instance);
            var movieClip = StringTable_getMovieClip(getStrPtr("sc/debug.sc"), getStrPtr("debug_menu_category"));
            new NativeFunction(instance.readPointer().add(352).readPointer(), 'void', [
                'pointer',
                'pointer',
                'bool'
            ])(instance, movieClip, 1);

            let textField = MovieClip_getTextFieldByName(movieClip, getStrPtr("Text"));
            let gradient = LogicDataTables_getColorGradientByName(getScPtr("Plus"), 1);
            MovieClipHelper_setTextAndScaleIfNecessary(textField, getScPtr(`+ ${name}`), 1, 0);
            DecoratedTextField_setupDecoratedText(textField, getScPtr(`+ ${name}`), gradient);

            setHeightWidth(instance, 0.735, 0.735);

            return {
                ins: instance,
                name: name
            };
        },
        addDebugMenuButton(name, category, onClick = null, initialFrame = 1) {
            var instance = malloc(544);
            GameButton_GameButton(instance);
            var movieClip = StringTable_getMovieClip(getStrPtr("sc/debug.sc"), getStrPtr("debug_menu_item"));
            gotoAndStop(movieClip, initialFrame);
            new NativeFunction(instance.readPointer().add(352).readPointer(), 'void', [
                'pointer',
                'pointer',
                'bool'
            ])(instance, movieClip, 1);

            let textField = MovieClip_getTextFieldByName(movieClip, getStrPtr("Text"));
            let gradient = LogicDataTables_getColorGradientByName(getScPtr("Name11"), 1);
            MovieClipHelper_setTextAndScaleIfNecessary(textField, getScPtr(name), 1, 0);
            DecoratedTextField_setupDecoratedText(textField, getScPtr(name), gradient);

            setHeightWidth(instance, 0.735, 0.735);

            return {
                ins: instance,
                cat: category,
                name: name,
                onClick: onClick,
                textField: textField,
                movieClip: movieClip
            }
        },
        toggleMenu() {
            if (isDebugOpened) {
                isDebugOpened = false;
                hideObject(debugMenu);
                debugMenu = null;
                this.closeCategoryAndButtons();
            } else {
                isDebugOpened = true;
                Stage_addChild(stageInstance, debugMenu);
                var y = 0;
                for (var x of debugCategorys) {
                    showObject(x.ins, getXY(debugMenu).x-110, (y * 42) + 11());
                    Stage_addChild(stageInstance, x.ins);
                    y++;
                }
                for (var x in debugButtons) {
                    if (debugButtons[x].cat == null) {
                        showObject(debugButtons[x].ins, getXY(debugMenu).x-110, (y * 42) + 115);
                        Stage_addChild(stageInstance, debugButtons[x].ins);
                        y++;
                    }
                }
                if (state.autoDodgeButton) {
                    gotoAndStop(state.autoDodgeButton.movieClip, state.dodgeActive ? 2 : 1);
                }
                if (state.aimbotButton) {
                    gotoAndStop(state.aimbotButton.movieClip, state.aimbotActive ? 2 : 1);
                }
                if (state.spinButton) {
                    gotoAndStop(state.spinButton.movieClip, state.spinActive ? 2 : 1);
                }
            }
        },
        closeCategoryAndButtons() {
            openedCatName = "";
            for (var x of debugCategorys) {
                hideObject(x.ins);
                let movieClip = StringTable_getMovieClip(getStrPtr("sc/debug.sc"), getStrPtr("debug_menu_category"));
                let textField = MovieClip_getTextFieldByName(movieClip, getStrPtr("Text"));
                let gradient = LogicDataTables_getColorGradientByName(getScPtr("Name10"), 1);
                MovieClipHelper_setTextAndScaleIfNecessary(textField, getScPtr(`+ ${x.name}`), 1, 0);
                DecoratedTextField_setupDecoratedText(textField, getScPtr(`+ ${x.name}`), gradient);
            }
            for (var x in debugButtons) {
                hideObject(debugButtons[x].ins);
            }

            debugButtons = [];
            debugCategorys = [];
        },
        closeCategory(category) {
            openedCatName = "";
            for (var x in debugButtons) {
                if (debugButtons[x].cat == category) {
                    hideObject(debugButtons[x].ins);
                }
            }
            for (var cat of debugCategorys) {
                if (cat.name == category) {
                    let movieClip = StringTable_getMovieClip(getStrPtr("sc/debug.sc"), getStrPtr("debug_menu_category"));
                    let textField = MovieClip_getTextFieldByName(movieClip, getStrPtr("Text"));
                    let gradient = LogicDataTables_getColorGradientByName(getScPtr("Name10"), 1);
                    MovieClipHelper_setTextAndScaleIfNecessary(textField, getScPtr(`+ ${cat.name}`), 1, 0);
                    DecoratedTextField_setupDecoratedText(textField, getScPtr(`+ ${cat.name}`), gradient);
                }
            }
            this.repositionMenuItems();
        },
        openCategory(category) {
            if (openedCatName == category) {
                this.closeCategory(category);
                return;
            }
            for (var cat of debugCategorys) {
                if (cat.name != category) {
                    this.closeCategory(cat.name);
                }
            }
            for (var btn of debugButtons) {
                if (btn.cat != null) {
                    hideObject(btn.ins);
                }
            }
            openedCatName = category;
            var y = 1;
            var targetCategory = null;
            for (var cat of debugCategorys) {
                if (cat.name == category) {
                    targetCategory = cat;
                    let movieClip = StringTable_getMovieClip(getStrPtr("sc/debug.sc"), getStrPtr("debug_menu_category"));
                    let textField = MovieClip_getTextFieldByName(movieClip, getStrPtr("Text"));
                    let gradient = LogicDataTables_getColorGradientByName(getScPtr("Name10"), 1);
                    MovieClipHelper_setTextAndScaleIfNecessary(textField, getScPtr(`- ${cat.name}`), 1, 0);
                    DecoratedTextField_setupDecoratedText(textField, getScPtr(`- ${cat.name}`), gradient);
                }
            }
            for (var x in debugButtons) {
                if (debugButtons[x].cat == category) {
                    showObject(debugButtons[x].ins, getXY(debugMenu).x-110, getXY(targetCategory.ins).y + (y * 42));
                    Stage_addChild(stageInstance, debugButtons[x].ins);
                    y++;
                }
            }
            this.repositionMenuItems(category, y);
        },
        repositionMenuItems(openedCategory = null, openedButtonsCount = 0) {
            var y = 0;
            for (var x in debugButtons) {
                if (debugButtons[x].cat == null) {
                    showObject(debugButtons[x].ins, getXY(debugMenu).x-110, (y * 42) + 115);
                    Stage_addChild(stageInstance, debugButtons[x].ins);
                    y++;
                }
            }
            for (var x of debugCategorys) {
                if (openedCategory && x.name == openedCategory) {
                    showObject(x.ins, getXY(debugMenu).x-110, (y * 42) + 115);
                    Stage_addChild(stageInstance, x.ins);
                    y += openedButtonsCount;
                } else {
                    showObject(x.ins, getXY(debugMenu).x-110, (y * 42) + 115);
                    Stage_addChild(stageInstance, x.ins);
                    y++;
                }
            }
        }
    }

    var debugMenu = null;

    function removeMenu() {
        isDebugOpened = false;
        debugMenuBase.closeCategoryAndButtons();
        hideObject(debugMenu);
        debugMenu = null;
    }

    function openMenu() {
        if (debugMenu == null) {
            debugMenu = malloc(1000);
            debugMenuBase.init(debugMenu);
            debugMenuBase.setTitle(debugMenu, "Debug Menu");

            debugButtons.push(debugMenuBase.addDebugMenuButton("Restart Game", null));

            debugCategorys.push(debugMenuBase.createCategory("Config"));
            
            debugButtons.push(debugMenuBase.addDebugMenuButton("Increase Spin Speed", "Config", function() {
                state.spinSpeed += 0.1;
                showFloater(`Spin Speed: ${state.spinSpeed.toFixed(2)}`);
                console.log(`Spin Speed increased to: ${state.spinSpeed}`);
            }));

            debugButtons.push(debugMenuBase.addDebugMenuButton("Decrease Spin Speed", "Config", function() {
                state.spinSpeed = Math.max(0.1, state.spinSpeed - 0.1);
                showFloater(`Spin Speed: ${state.spinSpeed.toFixed(2)}`);
                console.log(`Spin Speed decreased to: ${state.spinSpeed}`);
            }));

            debugCategorys.push(debugMenuBase.createCategory("Battle Server"));
            state.autoDodgeButton = debugMenuBase.addDebugMenuButton("AutoDodge", "Battle Server", function() {
                state.dodgeActive = !state.dodgeActive;
                gotoAndStop(state.autoDodgeButton.movieClip, state.dodgeActive ? 2 : 1);
                console.log(`AutoDodge ${state.dodgeActive ? "enabled" : "disabled"}`);
                showFloater(`AutoDodge ${state.dodgeActive ? "enabled" : "disabled"}`);
            }, state.dodgeActive ? 2 : 1);
            debugButtons.push(state.autoDodgeButton);
            
            state.aimbotButton = debugMenuBase.addDebugMenuButton("Aimbot", "Battle Server", function() {
                state.aimbotActive = !state.aimbotActive;
                gotoAndStop(state.aimbotButton.movieClip, state.aimbotActive ? 2 : 1);
                console.log(`Aimbot ${state.aimbotActive ? "enabled" : "disabled"}`);
                showFloater(`Aimbot ${state.aimbotActive ? "enabled" : "disabled"}`);
            }, state.aimbotActive ? 2 : 1);
            debugButtons.push(state.aimbotButton);
            
            state.spinButton = debugMenuBase.addDebugMenuButton("Spin", "Battle Server", function() {
                state.spinActive = !state.spinActive;
                gotoAndStop(state.spinButton.movieClip, state.spinActive ? 2 : 1);
                console.log(`Spin ${state.spinActive ? "enabled" : "disabled"}`);
                showFloater(`Spin ${state.spinActive ? "enabled" : "disabled"}`);
            }, state.spinActive ? 2 : 1);
            debugButtons.push(state.spinButton);

            debugCategorys.push(debugMenuBase.createCategory("Camera"));
            debugButtons.push(debugMenuBase.addDebugMenuButton("Next Camera Mode", "Camera", function() {
                showFloater("Next Camera Mode clicked");
                console.log("Next Camera Mode clicked!");
            }));

            debugCategorys.push(debugMenuBase.createCategory("Xray"));
            debugButtons.push(debugMenuBase.addDebugMenuButton("Simple Button", "Xray", function() {
                showFloater("Simple Button clicked");
                console.log("Simple Button clicked!");
            }));

            debugCategorys.push(debugMenuBase.createCategory("Interface"));

            var blueBtn = debugMenuBase.addDebugMenuButton("Blue Button", "Interface", toggleBlueButton);
            debugButtons.push(blueBtn);

            var greenBtn = debugMenuBase.addDebugMenuButton("Green Button", "Interface", toggleGreenButton);
            debugButtons.push(greenBtn);

            var brawlTvBtn = debugMenuBase.addDebugMenuButton("Brawl TV", "Interface", toggleBrawlTvButton);
            debugButtons.push(brawlTvBtn);

            console.log("Init");
        }

        var v1 = 0.1;
        var v2 = stageInstance.add(88).readFloat();
        var v3 = stageInstance.add(84).readFloat();
        if (stageInstance.add(7232).readFloat() != 0.0) {
            v1 = stageInstance.add(7232).readFloat();
        }
        var v4 = stageInstance.add(7376).readInt();
        var proVal = v4 - (v3 + v2) / v1;

        debugMenu.add(78).writeU8(1);
        DisplayObject_setPixelSnappedXY(debugMenu, proVal, 0);

        Stage_addChild(stageInstance, debugMenu);
        debugMenuBase.repositionMenuItems();
    }

    var menuOpened = false;

    let dButton = null;

    function createDButton() {
        if (dButton) {
            return;
        }
        dButton = malloc(544);
        GameButton_GameButton(dButton);
        const movieClip = StringTable_getMovieClip(getStrPtr("sc/debug.sc"), getStrPtr("debug_button"));
        new NativeFunction(dButton.readPointer().add(352).readPointer(), 'void', [
            'pointer', 'pointer', 'bool'
        ])(dButton, movieClip, 1);
        TextField_setText(dButton, getScPtr("D"), 1);
        setXY(dButton, 0, 560);
        setHeightWidth(dButton, 1, 1);
        dButton.add(78).writeU8(1);
        Stage_addChild(stageInstance, dButton);
    }
    const CustomButton_buttonPressed = base.add(0xACEDD4);

    Interceptor.attach(new NativeFunction(CustomButton_buttonPressed, 'void', ['pointer']), {
        onEnter(args) {
            var a1 = args[0];
            var intPtr = a1.toInt32();

            try {
                for (var cat of debugCategorys) {
                    if (intPtr == cat.ins.toInt32()) {
                        debugMenuBase.openCategory(cat.name);
                    }
                }

                for (var btn of debugButtons) {
                    if (intPtr == btn.ins.toInt32() && btn.onClick) {
                        btn.onClick();
                    }
                }

                if (intPtr == dButton.toInt32()) {
                    if (!menuOpened) {
                        openMenu();
                        menuOpened = true;
                    } else {
                        removeMenu();
                        menuOpened = false;
                    }
                }
            } catch (e) {
                console.log("Error in button handler: " + e);
            }
        }
    });

    Interceptor.attach(base.add(OFFSETS.JOYSTICK_FUNC_OFFSET), {
        onEnter(args) {
            const param1_ptr = args[0];
            
            if (state.spinActive) {
                try {
                    const desiredDeltaX = state.spinRadius * Math.cos(state.spinAngle);
                    const desiredDeltaY = state.spinRadius * Math.sin(state.spinAngle);

                    state.spinAngle += state.spinSpeed;
                    if (state.spinAngle > 2 * Math.PI) {
                        state.spinAngle -= 2 * Math.PI;
                    }

                    const centerX = Memory.readFloat(param1_ptr.add(OFFSETS.OFFSET_JOYSTICK_CENTER_X));
                    const centerY = Memory.readFloat(param1_ptr.add(OFFSETS.OFFSET_JOYSTICK_CENTER_Y));

                    const newCurrentX = centerX + desiredDeltaX;
                    const newCurrentY = centerY + desiredDeltaY;

                    Memory.writeFloat(param1_ptr.add(OFFSETS.OFFSET_JOYSTICK_CURRENT_X), newCurrentX);
                    Memory.writeFloat(param1_ptr.add(OFFSETS.OFFSET_JOYSTICK_CURRENT_Y), newCurrentY);
                } catch (e) {
                    console.error("Error in spin hook: " + e);
                }
            }
        }
    });
}

setTimeout(() => {
    load();
}, 1000);