
import { Snapshot, loadBootstrapFile } from '.'

let _mainSnapshot: Snapshot;

export default async function getMainSnapshot() {
    if (!_mainSnapshot) {
        const snapshot = new Snapshot();

        await loadBootstrapFile(snapshot, `${__dirname}/../../bootstrap/_prelude.p`);
        await loadBootstrapFile(snapshot, `${__dirname}/../../bootstrap/workingdir.p`);
        await loadBootstrapFile(snapshot, `${__dirname}/../../bootstrap/my-local-env.p`);

        _mainSnapshot = snapshot;
    }

    return _mainSnapshot;
}
