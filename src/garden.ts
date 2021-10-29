import * as core from '@actions/core'
import { promises as fs } from "fs";
import { getPlatform } from './system';
import * as tc from "@actions/tool-cache";
import { debug, info, warning } from '@actions/core';
import * as httpm from "@actions/http-client";
import constant from './constants'


export async function setupGarden() {
    core.startGroup('Setup Garden')
    const inpVersion = core.getInput("garden-version")
    let installPath: string | undefined
    if (!inpVersion) {
        const cachedVersions = tc.findAllVersions(constant.GARDEN_CACHE_KEY);
        if (cachedVersions) installPath = cachedVersions[0]
    } else {
        installPath = tc.find(
            constant.GARDEN_CACHE_KEY,
            inpVersion
        )
    }
    if (!installPath) {
        debug('Garden not found in cache, need to download')
        installPath = await installGarden(inpVersion)
    }
    if (installPath) {
        info(`Added Garden CLI to PATH: "${installPath}"`)
        core.addPath(installPath)
    }
    core.endGroup()
}

async function installGarden(inpVersion: string): Promise<string | undefined> {
    let url: string
    if (inpVersion) {
        url = `https://api.github.com/repos/garden-io/garden/releases/tags/${inpVersion}`
    } else {
        url = 'https://api.github.com/repos/garden-io/garden/releases/latest'
    }
    let release = await findValidAsset(url, `${getPlatform()}-amd64`)
    info(`Found valid Garden release: ${release.tag_name}`)
    let astBinary: ISdkAsset | undefined
    let astCheck: ISdkAsset | undefined
    for (let i = 0; i < release.assets.length; i++) {
        let asset = release.assets[i];
        if (asset.name.endsWith(".sha256")) astCheck = asset;
        else astBinary = asset;
    }
    if (astBinary && astCheck) {
        info(`Found matching tar: "${astBinary.name}". Downloading...`)
        const tarPath = await tc.downloadTool(astBinary.browser_download_url, astBinary.name)
        const binaryPath = await tc.extractTar(tarPath)
        return await tc.cacheDir(
            binaryPath,
            constant.GARDEN_CACHE_KEY,
            release.tag_name
        );
    }
}

interface ISdkAsset {
    url: string;
    name: string;
    browser_download_url: string;
}

interface ISdkRelease {
    url: string;
    tag_name: string;
    assets: ISdkAsset[];
}

async function findValidAsset(releaseUrl: string, assetFilter: string): Promise<ISdkRelease> {
    let http = new httpm.HttpClient("action-cd-deploy")
    let response = await http.getJson<ISdkRelease>(releaseUrl)
    if (response.statusCode != 200) {
        throw new Error(`Unable to fetch from ${releaseUrl}. Maybe invalid version.`)
    }
    let releaseSpec = response.result
    if (!releaseSpec) {
        throw new Error("Invalid garden version provided")
    }
    let matchedAssets = releaseSpec.assets.filter((asset) =>
        asset.name.includes(assetFilter)
    )
    if (matchedAssets) {
        let result = <ISdkRelease>Object.assign({}, releaseSpec)
        result.assets = matchedAssets
        return result
    }
    throw new Error(`unable to find valid asset for platform - ${assetFilter}`)
}
