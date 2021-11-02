import * as core from '@actions/core'
import { debug, info, warning } from '@actions/core'
import * as exec from 'execa'

export interface ICluster {
    clusterName: string
    gardenEnv: string
    clusterRegion: string
    isProduction: boolean
    matchDeployEnv: (deployEnv: string) => boolean
}

export const CLUSTERS: ICluster[] = [
    {
        clusterName: 'headout',
        clusterRegion: 'us-east-1',
        gardenEnv: "production",
        isProduction: true,
        matchDeployEnv: (deployEnv) => deployEnv === 'production'
    },
    {
        clusterName: 'test-cluster',
        clusterRegion: 'ap-south-1',
        gardenEnv: "test",
        isProduction: false,
        matchDeployEnv: () => true
    }
]

export async function setupCluster(): Promise<ICluster> {
    core.startGroup('Setup Cluster')
    const deployEnv = core.getInput('deploy-env', { required: true })
    const cluster = await loginToCluster(deployEnv)
    await assertCurrentContext()
    core.setOutput('cluster-name', cluster.clusterName)
    core.setOutput('cluster-region', cluster.clusterRegion)
    core.setOutput('is-production', cluster.isProduction)
    core.endGroup()
    return cluster
}

async function loginToCluster(deployEnv: string): Promise<ICluster> {
    const matchedCluster = CLUSTERS.find((cluster) => cluster.matchDeployEnv(deployEnv))
    if (!matchedCluster) throw new Error('unable to find any valid cluster')
    info(`Deploying to cluster: ${JSON.stringify(matchedCluster)}`)
    const cmd = `eksctl utils write-kubeconfig --region "${matchedCluster.clusterRegion}" --cluster "${matchedCluster.clusterName}"`
    info(`Executing: ${cmd}`)
    const cp = exec.command(cmd, { all: true })
    cp.all?.pipe(process.stdout)
    await cp
    return matchedCluster
}

async function assertCurrentContext() {
    const { stdout } = await exec.command('kubectl config get-contexts')
    info(stdout)
}
