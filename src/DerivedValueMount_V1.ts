
import Graph from './Graph'
import Relation from './Relation'
import StorageProvider from './StorageProvider'
import Pattern from './Pattern'
import RelationSearch from './RelationSearch'
import UpdateContext from './UpdateContext'
import { runSearch } from './Search'
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

    runSearch(search: RelationSearch) {
        
        const subSearch: RelationSearch = {
            pattern: search.pattern.removeType(this.mountTypename),
            subSearchDepth: search.subSearchDepth + 1,
            relation: (rel: Relation) => {
                
                const cxt = new UpdateContext(this.graph);
                const derivedValue = this.callback(cxt, rel);

                const foundPattern = rel.copy();
                foundPattern.addTag(this.mountTypename);
                foundPattern.setValue(derivedValue);
                search.relation(foundPattern);

            },
            finish() {
                search.finish();
            },
            isDone() {
                return search.isDone()
            }
        }
        
        runSearch(this.graph, subSearch);
    }

    async runSave(command: Command, output: RelationReceiver) {
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
