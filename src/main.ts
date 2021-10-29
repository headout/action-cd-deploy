import { setupGarden } from './garden'
import * as core from '@actions/core'
import { setupCluster } from './clusters';
import { deployService } from './deploy';

async function main() {
    await setupGarden();
    await deployService(await setupCluster());
}

main().catch(core.setFailed)
