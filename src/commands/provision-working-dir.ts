#! /usr/bin/env node

import { implement, Query } from '..'
import { runAsMain } from '../framework'
import { mkdirp } from 'fs-extra'
import { print } from '../utils'
import path from 'path'

implement('provision-working-dir', async (query: Query) => {
    const rootWorkingDir = await query.get('filesystem.workingdir');
    const dirName = await query.get('dir-name');

    const fullDir = path.join(rootWorkingDir, dirName);

    await mkdirp(fullDir);

    query.respond({createdDir: fullDir});
});
