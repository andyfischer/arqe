
import { Snapshot } from '.'
import { readTextLinesSync } from '../utils'

export default async function loadBootstrapFile(snapshot: Snapshot, filename: string) {
    const lines = readTextLinesSync(filename);

    for (const line of lines) {
        await snapshot.applyQuery(line, { isInteractive: false } );
    }

    await snapshot.applyQuery('eof', { isInteractive: false });
}
