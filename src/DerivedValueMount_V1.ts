
import Graph from './Graph'
import Relation from './Relation'
import StorageProvider from './StorageProvider'
import Pattern from './Pattern'
import SearchOperation from './SearchOperation'
import UpdateContext from './UpdateContext'
import runSearch from './runSearch'
import { parsePattern } from './parseCommand'
import RelationReceiver from './RelationReceiver'
import Command from './Command'

type DeriveFunc = (cxt: UpdateContext, rel: Pattern) => any

export default class DerivedValueMount implements StorageProvider {

    graph: Graph
    mountTypename: string
    callback: DeriveFunc

    constructor(graph: Graph, callback: DeriveFunc, mountTypename: string) {
        this.graph = graph;
        this.mountTypename = mountTypename;
        this.callback = callback;
    }

    runSearch(search: SearchOperation) {
        
        const subSearch: SearchOperation = {
            graph: search.graph,
            pattern: search.pattern.removeType(this.mountTypename),
            subSearchDepth: search.subSearchDepth + 1,
            relation: (rel: Relation) => {
                
                const cxt = new UpdateContext(this.graph);
                const derivedValue = this.callback(cxt, rel);

                const foundPattern = rel
                    .addTagStr(this.mountTypename)
                    .addTagStr('value/' + derivedValue);

                search.relation(foundPattern);
            },
            finish() {
                search.finish();
            },
        }
        
        runSearch(subSearch);
    }

    async runSave(rel: Relation, output: RelationReceiver) {
        throw new Error("can't save on a derived value");
    }
}

export function mountDerivedTag(graph: Graph, patternStr: string, keyTag: string, callback: DeriveFunc) {

    const pattern = parsePattern(patternStr);

    graph.derivedValueMounts.push({
        pattern,
        storage: new DerivedValueMount(graph, callback, keyTag)
    });
}
