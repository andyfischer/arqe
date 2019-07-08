
import os from 'os'
import path from 'path'
import fs from 'fs-extra'
import { Snapshot, loadDataFile } from '../framework'

let _mainSnapshot: Snapshot;

export default async function loadMainSnapshot() {
    if (!_mainSnapshot) {
        const snapshot = new Snapshot();

        await loadDataFile(snapshot, `${__dirname}/../../data/_bootstrap.p`);

        for (const script in snapshot.getValue('bootstrapScripts').scripts)
            await loadDataFile(snapshot, `${__dirname}/../../data/${script}`);

        const userEnv = path.join(os.homedir(), '.futureshell/env.p');
        await loadDataFile(snapshot, userEnv);

        if (await fs.exists('.fshell'))
            await loadDataFile(snapshot, '.fshell');

        _mainSnapshot = snapshot;
    }

    return _mainSnapshot;
}
