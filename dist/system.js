"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatform = void 0;
function getPlatform() {
    let targetPlat;
    let plat = process.platform;
    switch (plat) {
        case "linux":
            targetPlat = "linux";
            break;
        case "darwin":
            targetPlat = "macos";
            break;
        case "win32":
            targetPlat = "windows";
            break;
        default:
            targetPlat = plat;
    }
    return targetPlat;
}
exports.getPlatform = getPlatform;
