#! /usr/bin/env node

import { CommandContext, declareCommand, runAsMain } from '../framework'
import { mkdirp } from 'fs-extra'
import { print } from '../utils'
import path from 'path'

async function run(context: CommandContext) {
    const rootWorkingDir = await context.get('filesystem.workingdir');
    const dirName = await context.get('dir-name');

    const fullDir = path.join(rootWorkingDir, dirName);

    await mkdirp(fullDir);

    context.results['created-dir'] = fullDir;
}

const command = declareCommand({
    name: 'provision-working-dir',
    run
});

if (require.main === module) {
    runAsMain(command);
}

