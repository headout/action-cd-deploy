import * as core from '@actions/core'
import { info, error } from '@actions/core'
import { ICluster } from "./clusters"
import * as exec from 'execa'

export async function deployService(cluster: ICluster) {
    core.startGroup('Deploy Service')
    let cmd = `garden deploy --env ${cluster.gardenEnv}`
    let cmdEnv = { GARDEN_LOGGER_TYPE: "basic", NAMESPACE: "cd" }
    info(`Executing "${cmd}" with env: ${JSON.stringify(cmdEnv)}`)
    try {
        exec.command(cmd, { env: cmdEnv }).stdout?.pipe(process.stdout)
    } catch (ex) {
        error(`Unable to deploy, error: ${ex}`)
        throw ex
    }
    core.endGroup()
}
