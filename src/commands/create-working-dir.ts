import { Query } from '..'
import { runAsMain } from '../framework'
import { mkdirp } from 'fs-extra'
import { print, randomHex } from '../utils'
import path from 'path'
import { Snapshot } from '../framework'

export default function(snapshot: Snapshot) {
    snapshot.implement('create-working-dir', async (query: Query) => {
        const rootWorkingDir = query.get('filesystem.workingdir');
        const dirName = query.getOptional('dir-name', 'anon');
        const hash = randomHex(6);

        const fullDir = path.join(rootWorkingDir, `${dirName}-${hash}`);

        await mkdirp(fullDir);

        query.respond({dir: fullDir});
    });
}
