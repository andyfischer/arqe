
import Graph from './Graph'
import Relation from './Relation'
import StorageProvider from './StorageProvider'
import SetOperation from './SetOperation'
import RelationPattern from './RelationPattern'
import RelationSearch from './RelationSearch'
import UpdateContext from './UpdateContext'
import { runSearch } from './Search'
import { parsePattern } from './parseCommand'

type SearchCallback = (cxt: UpdateContext, search: RelationSearch) => void

export default class DerivedValueMount implements StorageProvider {

    graph: Graph
    callback: SearchCallback

    constructor(graph: Graph, callback: SearchCallback) {
        this.graph = graph;
        this.callback = callback;
    }

    runSearch(search: RelationSearch) {
        
        const cxt = new UpdateContext(this.graph);
        this.callback(cxt, search)

        /*
        const subSearch: RelationSearch = {
            pattern: search.pattern.removeType(this.mountTypename),
            subSearchDepth: search.subSearchDepth + 1,
            start() {},
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
        */
    }

    async runSave(set: SetOperation) {
        throw new Error("can't save on a derived value");
    }
}

export function mountDerivedTag(graph: Graph, patternStr: string, callback: SearchCallback) {

    const pattern = parsePattern(patternStr);

    graph.derivedValueMounts.push({
        pattern,
        storage: new DerivedValueMount(graph, callback)
    });
}
