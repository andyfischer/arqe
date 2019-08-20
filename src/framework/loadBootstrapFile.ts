
import Fs from 'fs-extra'
import { Snapshot } from '.'
import { runQueryInput } from '../query'

export default async function loadBootstrapFile(snapshot: Snapshot, filename: string) {
    const contents = await Fs.readFile(filename, 'utf8');

    await runQueryInput(snapshot, contents, { sourceFilename: filename });

    await runQueryInput(snapshot, 'eof', { isInteractive: false });
}
