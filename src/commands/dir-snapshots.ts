
import { implement, Query, performedAction } from '..'
import path from 'path'
import { exec, print } from '../utils'
import { Snapshot } from '../framework'

export default function(snapsho: Snapshot) {
    implement('save-dir-snapshot', async (query: Query) => {
        const name = query.get('snapshot-name');
        const snapshotDir = query.get('stored-snapshot-dir');

        const filename = path.join(snapshotDir, name + '.tar.gz');

        print('saving snapshot to: ' + filename);
        await exec(`tar -zcvf ${filename} .`);

        query.respond(performedAction(`saved snapshot to: ${filename}`));
    });

    implement('restore-dir-snapshot', async (query: Query) => {
        const name = query.get('snapshot-name');
        const snapshotDir = query.get('stored-snapshot-dir');

        const filename = path.join(snapshotDir, name + '.tar.gz');

        print('reading snapshot: ' + filename);
        await exec(`tar -xjvf ${filename}`);

        query.respond(performedAction(`extracted snapshot from: ${filename}`));
    });
}
