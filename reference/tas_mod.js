// @name         Boxel 3D TAS
// @namespace    http://tampermonkey.net/
// @version      v2.1.1
// @description  A TAS for Boxel 3D
// @author       Charlieee1
// @match        *dopplercreative.com/test/v1*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

var loadInputs;
var loadSaveState;
var getTasSaveState;
var clearSaveState;
var showOnlyHitboxes = false;
var pauseOnTasEnd = false;

(function() {
    'use strict';

    // j for jump
    var inputs = ["j", 60, "j"];
    var tempInputs = [];
    var enabled = false;
    var savestate = null;
    var savestateEnabled = false;

    loadInputs = function(newInputs) {
        inputs = newInputs;
    }

    loadSaveState = function(newSaveState) {
        savestate = newSaveState;
        savestateEnabled = true;
    }

    getTasSaveState = function(save = true) {
        let newSaveState = getSaveState();
        newSaveState.tasTime = getFrameCount();
        newSaveState.tasControls = {
            left: app.player.controls.left,
            right: app.player.controls.right
        };
        if (save) {
            loadSaveState(newSaveState);
        }
        return savestate;
    }

    clearSaveState = function() {
        savestate = null;
        savestateEnabled = false;
    }

    window.addEventListener("keydown", function(e) {
        if (e.key == "t") {
            app.player.removeRope();
            tempInputs = [...inputs];
            setFrameCount(0);

            if (!savestateEnabled) {
                app.player.controls.left = 0;
                app.player.controls.right = 0;
                app.level.retryLevel();

                app.level.children.forEach((obj) => {
                    if (!obj.isStatic()) {
                        Matter.Body.setVelocity(obj.body, {x:0,y:0}, false);
                    }
                });
            } else {
                enabled = false;
                setSaveState(savestate);
                app.player.controls.left = savestate.tasControls.left;
                app.player.controls.right = savestate.tasControls.right;
                setFrameCount(savestate.tasTime);
                for (let i = 0; i < savestate.tasTime - 1; i++) {
                    if (tempInputs.length == 0) break;
                    consumeInputs();
                }
                //console.log(tempInputs);
            }

            enabled = true;
            if (showOnlyHitboxes) {
                showHitboxes();
                showLevel(false);
            }
        } else if (e.key == "T") {
            enabled = false;
        }
    });

    function consumeInputs() {
        for (let i=0; i < 4; i++) {
            if (tempInputs.length == 0) break;
            let nextInput = tempInputs[0];
            if (nextInput == "undefined") break;
            if (typeof nextInput == "number") {
                if (nextInput == 0) {
                    //console.log("waiting is over");
                    tempInputs.splice(0, 1);
                    continue;
                }
                //console.log(nextInput);
                tempInputs[0]--;
                break;
            }
            tempInputs.splice(0, 1);
            //console.log("non-number supposed to be processed");
            if (!enabled) continue;
            if (nextInput == "j") {
                console.log("jumping " + canJump());
                app.player.jump();
            } else if (nextInput == "a") {
                app.player.controls.left = -1;
            } else if (nextInput == "d") {
                app.player.controls.right = 1;
            } else if (nextInput == "A") {
                app.player.controls.left = 0;
            } else if (nextInput == "D") {
                app.player.controls.right = 0;
            } else if (nextInput.slice(0, 1) == "g") {
                // Spider grappling made by Defenders & Charlieee1
                let angle = Number(nextInput.slice(1) * Math.PI / 180);
                app.player.addRope({
                    x: app.player.position.x + Math.cos(angle),
                    y: app.player.position.y + Math.sin(angle)
                });
            } else if (nextInput == "G") {
                app.player.removeRope();
            } else if (nextInput == "c") {
                app.player.restart();
            }
        }
    }

    addUpdateFunction(function() {
        if (!enabled) {
            return;
        }
        if (tempInputs.length == 0) {
            if (pauseOnTasEnd) pause();
            enabled = false;
            return;
        }
        consumeInputs();
    });

    // Mod list
    addModToList("TAS");
})();
