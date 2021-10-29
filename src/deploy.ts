import * as core from '@actions/core'
import { error } from '@actions/core'
import { ICluster } from "./clusters"
// @ts-ignore
import exec from 'await-exec'

export async function deployService(cluster: ICluster) {
    core.startGroup('Deploy Service')
    let cmd = `garden deploy --env ${cluster.gardenEnv}`
    try {
        await exec(
            cmd,
            {
                log: true,
                env: { ...process.env, GARDEN_LOGGER_TYPE: "basic", NAMESPACE: "cd" }
            }
        )
    } catch (ex) {
        error(`Unable to deploy, error: ${ex}`)
        throw ex
    }
    core.endGroup()
}
