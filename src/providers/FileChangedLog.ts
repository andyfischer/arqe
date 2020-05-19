
import Graph from '../Graph'
import FileChangeLogAPI from './generated/FileChangeLogAPI'

import { notifyFileChanged } from '../file-watch/notifyFileChanged'

export default function init(graph: Graph) {
    return new FileChangeLogAPI({
        onChange(filename: string) {
            notifyFileChanged(graph, filename);
        }
    });
}

