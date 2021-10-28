import { setupGarden } from './garden'
import * as core from '@actions/core'

async function main() {
    setupGarden();
}

main().catch(core.setFailed)
