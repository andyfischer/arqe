
import { Snapshot } from '.'
import { readTextLinesSync } from '../utils'

export default async function loadBootstrapFile(snapshot: Snapshot, filename: string) {
    const lines = readTextLinesSync(filename);

    for (const line of lines) {
        await snapshot.submitQuery(line, { isInteractive: false } );
    }

    await snapshot.submitQuery('eof', { isInteractive: false });
}
