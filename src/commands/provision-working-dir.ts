#! /usr/bin/env node

import { Query } from '..'
import { CommandContext, declareCommand, runAsMain } from '../framework'
import { mkdirp } from 'fs-extra'
import { print } from '../utils'
import path from 'path'

async function run(query: Query) {
    const rootWorkingDir = await query.get('filesystem.workingdir');
    const dirName = await query.get('dir-name');

    const fullDir = path.join(rootWorkingDir, dirName);

    await mkdirp(fullDir);

    query.respond({createdDir: fullDir});
}

const command = declareCommand({
    name: 'provision-working-dir',
    run
});

if (require.main === module) {
    runAsMain(command);
}

