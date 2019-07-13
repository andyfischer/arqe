
import os from 'os'
import path from 'path'
import { Snapshot } from '../snapshot'
import { loadBootstrapFile } from '../framework'

let _mainSnapshot: Snapshot;

export default async function loadMainSnapshot() {
    if (!_mainSnapshot) {
        const snapshot = new Snapshot();

        await loadBootstrapFile(snapshot, `${__dirname}/../../bootstrap/_prelude.p`);

        for (const script in snapshot.getValue('bootstrapScripts').scripts)
            await loadBootstrapFile(snapshot, `${__dirname}/../../bootstrap/${script}`);

        const userEnv = path.join(os.homedir(), '.papert/env.p');
        await loadBootstrapFile(snapshot, userEnv);

        _mainSnapshot = snapshot;
    }

    return _mainSnapshot;
}
