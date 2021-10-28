import * as os from "os";

export function getPlatform(): string {
    let targetPlat: string;
    let plat = os.platform();
    switch (plat) {
        case "linux":
            targetPlat = "linux";
            break;
        case "darwin":
            targetPlat = "macos";
            break;
        default:
            targetPlat = plat;
    }
    return targetPlat;
}
