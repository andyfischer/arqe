#! /usr/bin/env node

import { implement, Query } from '..'
import { runAsMain } from '../framework'
import { mkdirp } from 'fs-extra'
import { print, randomHex } from '../utils'
import path from 'path'

implement('create-working-dir', async (query: Query) => {
    const rootWorkingDir = query.get('filesystem.workingdir');
    const dirName = query.getOptional('name', 'anon');
    const hash = randomHex(4);

    const fullDir = path.join(rootWorkingDir, `${dirName}-${hash}`);

    await mkdirp(fullDir);

    query.respond({createdDir: fullDir});
});
