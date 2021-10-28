import * as core from '@actions/core'
import { debug, info, warning } from '@actions/core'
// @ts-ignore
import exec from 'await-exec'

interface ICluster {
    clusterName: string
    clusterRegion: string
    isProduction: boolean
    matchDeployEnv: (deployEnv: string) => boolean
}

export const CLUSTERS: ICluster[] = [
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
]

export async function setupCluster() {
    core.startGroup('Setup Cluster')
    const deployEnv = core.getInput('deploy-env', { required: true })
    const cluster = await loginToCluster(deployEnv)
    core.setOutput('cluster-name', cluster.clusterName)
    core.setOutput('cluster-region', cluster.clusterRegion)
    core.setOutput('is-production', cluster.isProduction)
    core.endGroup()
}

async function loginToCluster(deployEnv: string): Promise<ICluster> {
    const matchedCluster = CLUSTERS.find((cluster) => cluster.matchDeployEnv(deployEnv))
    if (!matchedCluster) throw new Error('unable to find any valid cluster')
    info(`Deploying to cluster: ${JSON.stringify(matchedCluster)}`)
    await exec(`eksctl utils write-kubeconfig --region "${matchedCluster.clusterRegion}" --cluster "${matchedCluster.clusterName}"`, { log: true })
    return matchedCluster
}
