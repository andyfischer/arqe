
import { readTextLinesSync } from '../utils'

export default async function loadBootstrapFile(snapshot, filename: string) {
    const lines = readTextLinesSync(filename);

    for (const line of lines) {
        await snapshot.applyQuery(line);
    }

    await snapshot.applyQuery('eof');
}
