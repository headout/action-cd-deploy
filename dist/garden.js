"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupGarden = void 0;
const core = __importStar(require("@actions/core"));
const system_1 = require("./system");
const tc = __importStar(require("@actions/tool-cache"));
const core_1 = require("@actions/core");
const httpm = __importStar(require("@actions/http-client"));
const constants_1 = __importDefault(require("./constants"));
function setupGarden() {
    return __awaiter(this, void 0, void 0, function* () {
        core.startGroup('Setup Garden');
        const inpVersion = core.getInput("garden-version");
        let installPath;
        if (!inpVersion) {
            const cachedVersions = tc.findAllVersions(constants_1.default.GARDEN_CACHE_KEY);
            if (cachedVersions)
                installPath = cachedVersions[0];
        }
        else {
            installPath = tc.find(constants_1.default.GARDEN_CACHE_KEY, inpVersion);
        }
        if (!installPath) {
            (0, core_1.debug)('Garden not found in cache, need to download');
            installPath = yield installGarden(inpVersion);
        }
        if (installPath) {
            (0, core_1.info)(`Added Garden CLI to PATH: "${installPath}"`);
            core.addPath(installPath);
        }
        core.endGroup();
    });
}
exports.setupGarden = setupGarden;
function installGarden(inpVersion) {
    return __awaiter(this, void 0, void 0, function* () {
        let url;
        if (inpVersion) {
            url = `https://api.github.com/repos/garden-io/garden/releases/tags/${inpVersion}`;
        }
        else {
            url = 'https://api.github.com/repos/garden-io/garden/releases/latest';
        }
        let folderName = `${(0, system_1.getPlatform)()}-amd64`;
        let release = yield findValidAsset(url, folderName);
        (0, core_1.info)(`Found valid Garden release: ${release.tag_name}`);
        let astBinary;
        let astCheck;
        for (let i = 0; i < release.assets.length; i++) {
            let asset = release.assets[i];
            if (asset.name.endsWith(".sha256"))
                astCheck = asset;
            else
                astBinary = asset;
        }
        if (astBinary && astCheck) {
            (0, core_1.info)(`Found matching tar: "${astBinary.name}". Downloading...`);
            const tarPath = yield tc.downloadTool(astBinary.browser_download_url, astBinary.name);
            const binaryPath = `${yield tc.extractTar(tarPath)}/${folderName}`;
            (0, core_1.info)(`Extracted tar to path: "${binaryPath}"`);
            return yield tc.cacheDir(binaryPath, constants_1.default.GARDEN_CACHE_KEY, release.tag_name);
        }
    });
}
function findValidAsset(releaseUrl, assetFilter) {
    return __awaiter(this, void 0, void 0, function* () {
        let http = new httpm.HttpClient("action-cd-deploy");
        let response = yield http.getJson(releaseUrl);
        if (response.statusCode != 200) {
            throw new Error(`Unable to fetch from ${releaseUrl}. Maybe invalid version.`);
        }
        let releaseSpec = response.result;
        if (!releaseSpec) {
            throw new Error("Invalid garden version provided");
        }
        let matchedAssets = releaseSpec.assets.filter((asset) => asset.name.includes(assetFilter));
        if (matchedAssets) {
            let result = Object.assign({}, releaseSpec);
            result.assets = matchedAssets;
            return result;
        }
        throw new Error(`unable to find valid asset for platform - ${assetFilter}`);
    });
}
