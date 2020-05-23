
import Graph from '../Graph'
import FileChangeLogAPI from './generated/FileChangeLogAPI'
import logError from '../logError'

import { notifyFileChanged } from '../file-watch/notifyFileChanged'

export default function init(graph: Graph) {
    if (typeof graph.run !== 'function')
        throw new Error('invalid graph');

    return new FileChangeLogAPI({
        onChange(filename: string) {
            notifyFileChanged(graph, filename)
            .catch(logError);
        }
    });
}

