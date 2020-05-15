
import Graph from '../Graph'
import FileChangeLogAPI from './generated/FileChangeLogAPI'

import { notifyFileChanged } from '../file-watch/notifyFileChanged'

export default function init(graph: Graph) {
    return new FileChangeLogAPI({
        onChange(filename: string) {
            notifyFileChanged(graph, filename);
        }
    });
    /*
    FileChangedLog {
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
    */
}
