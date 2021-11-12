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
exports.deployService = void 0;
const core = __importStar(require("@actions/core"));
const core_1 = require("@actions/core");
const execa_1 = __importDefault(require("execa"));
function deployService(cluster) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        core.startGroup('Deploy Service');
        const { stdout: context } = yield (0, execa_1.default)('kubectl', ['config', 'current-context']);
        let cmd = `garden deploy --env ${cluster.gardenEnv} --var kubeContext=${context} -l debug`;
        if (cluster.isProduction) {
            cmd = `${cmd} --yes`;
        }
        let cmdEnv = { GARDEN_LOGGER_TYPE: "basic", GARDEN_DISABLE_ANALYTICS: "true", NAMESPACE: "cd" };
        (0, core_1.info)(`Executing "${cmd}" with env: ${JSON.stringify(cmdEnv)}`);
        try {
            const cp = execa_1.default.command(cmd, { env: cmdEnv, all: true });
            (_a = cp.all) === null || _a === void 0 ? void 0 : _a.pipe(process.stdout);
            yield cp;
        }
        catch (ex) {
            (0, core_1.error)(`Unable to deploy, error: ${ex}`);
            throw ex;
        }
        core.endGroup();
    });
}
exports.deployService = deployService;
