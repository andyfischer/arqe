
import SaveSearchHook from '../SaveSearchHook'
import SearchOperation from '../SearchOperation'
import Graph from '../Graph'
import SaveOperation from '../SaveOperation'
import Pattern from '../Pattern'
import Relation from '../Relation'
import RelationReceiver from '../RelationReceiver'

import { notifyFileChanged } from '../file-watch/notifyFileChanged'

export default class FileChangedLog {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }

    useForPattern(pattern: Pattern) {
        return false;
    }

    saveNewRelation2(relation: Relation) {
    }

    getRelations(pattern: Pattern, output: RelationReceiver) {
        output.finish();
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
