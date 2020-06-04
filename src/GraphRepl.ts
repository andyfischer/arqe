
import Graph from './Graph'
import RelationReceiver from './RelationReceiver'
import { receiveToRelationList } from './receiveUtils'
import printAsTable from './console/printAsTable'
import Relation from './Relation'
import GraphLike from './GraphLike'

function trimEndline(str) {
    if (str.length > 0 && str[str.length-1] === '\n')
        return str.slice(0, str.length-1);

    return str;
}

function isMultiColumn(rels: Relation[]) {
    const columns = new Map()
    for (const rel of rels) {
        for (const tag of rel.tags) {
            columns.set(tag.tagType, true)
            if (columns.size > 1)
                return true;
        }
    }
    return false;
}

function printResult(rels: Relation[]) {
    if (isMultiColumn(rels)) {
        for (const line of printAsTable(rels)) {
            console.log('  ' + line);
        }
    } else {
        for (const rel of rels) {
            console.log('  ' + rel.stringify());
        }
    }
}

export default class GraphRepl {
    graph: GraphLike
    repl: any

    constructor(graph: GraphLike) {
        this.graph = graph;
    }

    async eval(line, onDone) {
        let isFinished = false;
        line = trimEndline(line);

        if (line === '') {
            onDone();
            return;
        }

        const listReceiver = receiveToRelationList((rels: Relation[]) => {
            printResult(rels);
            isFinished = true;
            onDone();
        });

        this.graph.run(line, {
            relation: (rel) => {
                if (isFinished)
                    throw new Error('got relation after finish()');

                if (rel.hasType('command-meta')) {
                    if (rel.hasType('error')) {
                        console.log('error: ' + rel.getTagValue('message'));
                    }

                    return;
                }

                listReceiver.relation(rel);
            },
            finish: () => {
                listReceiver.finish();
                onDone();
            }
        });
    }
}

