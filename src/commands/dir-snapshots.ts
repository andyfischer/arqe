
import { implement, Query } from '..'
import path from 'path'
import { exec, print } from '../utils'

implement('save-dir-snapshot', async (query: Query) => {
    const name = query.get('snapshot-name');
    const snapshotDir = query.get('stored-snapshot-dir');

    const filename = path.join(snapshotDir, name + '.tar.gz');

    print('saving snapshot to: ' + filename);
    await exec(`tar -zcvf ${filename} .`);

    query.respond({
        message: `saved snapshot to: ${filename}`
    });
});

implement('restore-dir-snapshot', async (query: Query) => {
    const name = query.get('snapshot-name');
    const snapshotDir = query.get('stored-snapshot-dir');

    const filename = path.join(snapshotDir, name + '.tar.gz');

    print('reading snapshot: ' + filename);
    await exec(`tar -xjvf ${filename}`);

    query.respond({
        message: `extracted snapshot from: ${filename}`
    });
});
