
import SaveSearchHook from '../SaveSearchHook'
import SearchOperation from '../SearchOperation'
import Graph from '../Graph'
import SaveOperation from '../SaveOperation'

import { notifyFileChanged } from '../file-watch/notifyFileChanged'

export default class FileChangedLog implements SaveSearchHook {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }

    hookSearch(search: SearchOperation) {
        return false;
    }

    hookSave(save: SaveOperation) {
        const { relation } = save;

        if (relation.hasType('log') && relation.hasType('file-changed')) {

            notifyFileChanged(this.graph, relation.getTagValue('filename'));

            save.output.relation(relation);
            save.output.finish();

            return true;
        }

        return false;
    }
}
