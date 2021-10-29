export function getPlatform(): string {
    let targetPlat: string;
    let plat = process.platform
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
