import * as core from '@actions/core'
import { info, error } from '@actions/core'
import { ICluster } from "./clusters"
import exec from 'execa'

export async function deployService(cluster: ICluster) {
    core.startGroup('Deploy Service')
    const { stdout: context } = await exec('kubectl', ['config', 'current-context'])
    let cmd = `garden deploy --env ${cluster.gardenEnv} --var kubeContext=${context}`
    let cmdEnv = { GARDEN_LOGGER_TYPE: "basic", NAMESPACE: "cd" }
    info(`Executing "${cmd}" with env: ${JSON.stringify(cmdEnv)}`)
    try {
        const cp = exec.command(cmd, { env: cmdEnv, all: true })
        cp.all?.pipe(process.stdout)
        await cp
    } catch (ex) {
        error(`Unable to deploy, error: ${ex}`)
        throw ex
    }
    core.endGroup()
}
