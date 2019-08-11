
import os from 'os'
import path from 'path'
import { Snapshot, loadBootstrapFile } from '../framework'

let _mainSnapshot: Snapshot;

export default async function loadMainSnapshot() {
    if (!_mainSnapshot) {
        const snapshot = new Snapshot();

        await loadBootstrapFile(snapshot, `${__dirname}/../../data/_bootstrap.p`);

        for (const script in snapshot.getValue('bootstrapScripts').scripts)
            await loadBootstrapFile(snapshot, `${__dirname}/../../data/${script}`);

        const userEnv = path.join(os.homedir(), '.futureshell/env.p');
        await loadBootstrapFile(snapshot, userEnv);

        _mainSnapshot = snapshot;
    }

    return _mainSnapshot;
}
