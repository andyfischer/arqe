
import { Snapshot, loadBootstrapFile } from '.'

let _mainSnapshot: Snapshot;

export default async function getMainSnapshot() {
    if (!_mainSnapshot) {
        const snapshot = new Snapshot();

        await loadBootstrapFile(snapshot, `${__dirname}/../../bootstrap/_prelude.p`);

        for (const script in snapshot.getValue('bootstrapScripts').scripts)
            await loadBootstrapFile(snapshot, `${__dirname}/../../bootstrap/${script}`);

        await loadBootstrapFile(snapshot, `${__dirname}/../../bootstrap/my-local-env.p`);

        _mainSnapshot = snapshot;
    }

    return _mainSnapshot;
}
