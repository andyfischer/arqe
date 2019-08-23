
import { implement, Query, print, error } from '..'
import { runAsMain } from '../framework'
import { mkdirp } from 'fs-extra'
import path from 'path'
import { exec } from '../utils'

implement('git-clone', async (query: Query) => {
    const repoUrl = query.get('repo-url');
    let dir = query.getOptional('dir', null);

    if (!dir)
        dir = (await query.subQuery('create-working-dir')).frame['dir'];

    if (!dir)
        return query.respond(error("couldn't find a working directory"))

    print(`running 'git clone' in ${dir}`);

    await exec(`git clone ${repoUrl}`, {
        cwd: dir
    });

    query.respond({ dir });
});

