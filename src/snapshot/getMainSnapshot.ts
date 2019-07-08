
import { Snapshot, loadBootstrapFile } from '.'

let _mainSnapshot: Snapshot;

export default async function getMainSnapshot() {
    if (!_mainSnapshot) {
        const snapshot = new Snapshot();

        await loadBootstrapFile(snapshot, `${__dirname}/../../bootstrap/_prelude.ev`);
        await loadBootstrapFile(snapshot, `${__dirname}/../../bootstrap/workingdir.ev`);

        await loadBootstrapFile(snapshot, `${__dirname}/../../bootstrap/my-local-env.ev`);

        _mainSnapshot = snapshot;
    }

    return _mainSnapshot;
}
