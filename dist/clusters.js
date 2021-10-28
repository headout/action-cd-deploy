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
exports.setupCluster = exports.CLUSTERS = void 0;
const core = __importStar(require("@actions/core"));
const core_1 = require("@actions/core");
// @ts-ignore
const await_exec_1 = __importDefault(require("await-exec"));
exports.CLUSTERS = [
    {
        clusterName: 'headout',
        clusterRegion: 'us-east-1',
        isProduction: true,
        matchDeployEnv: (deployEnv) => deployEnv === 'production'
    },
    {
        clusterName: 'test-cluster',
        clusterRegion: 'ap-south-1',
        isProduction: false,
        matchDeployEnv: () => true
    }
];
function setupCluster() {
    return __awaiter(this, void 0, void 0, function* () {
        core.startGroup('Setup Cluster');
        const deployEnv = core.getInput('deploy-env', { required: true });
        const cluster = yield loginToCluster(deployEnv);
        core.setOutput('cluster-name', cluster.clusterName);
        core.setOutput('cluster-region', cluster.clusterRegion);
        core.setOutput('is-production', cluster.isProduction);
        core.endGroup();
    });
}
exports.setupCluster = setupCluster;
function loginToCluster(deployEnv) {
    return __awaiter(this, void 0, void 0, function* () {
        const matchedCluster = exports.CLUSTERS.find((cluster) => cluster.matchDeployEnv(deployEnv));
        if (!matchedCluster)
            throw new Error('unable to find any valid cluster');
        (0, core_1.info)(`Deploying to cluster: ${JSON.stringify(matchedCluster)}`);
        yield (0, await_exec_1.default)(`eksctl utils write-kubeconfig --region "${matchedCluster.clusterRegion}" --cluster "${matchedCluster.clusterName}"`, { log: true });
        return matchedCluster;
    });
}
