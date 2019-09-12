
import { print, Snapshot } from '..'
import { runQueryInput, Query } from '../query'

export default function(snapshot: Snapshot) {
    snapshot.implement('watch', async (query: Query) => {
        // construct the query after the 'watch' command
        const toWatch = query.syntax.originalStr.replace(/^watch /, '');

        print('running: ' + toWatch);

        while (true) {
            await runQueryInput(snapshot, toWatch, { isInteractive: true });
        }
    });
}
