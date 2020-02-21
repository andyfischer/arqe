
import Graph from './Graph'
import Relation from './Relation'
import StorageProvider from './StorageProvider'
import SetOperation from './SetOperation'
import RelationPattern from './RelationPattern'
import RelationSearch from './RelationSearch'
import UpdateContext from './UpdateContext'
import { runSearch } from './Search'

type DeriveFunc = (cxt: UpdateContext, rel: RelationPattern) => any

export default class DerivedValueMount implements StorageProvider {

    graph: Graph
    mountTypename: string
    callback: DeriveFunc

    constructor(graph: Graph, callback: DeriveFunc, mountTypename: string) {
        this.mountTypename = mountTypename;
        this.callback = callback;
    }

    async runSearch(search: RelationSearch) {
        
        const subSearch: RelationSearch = {
            pattern: search.pattern.removeType(this.mountTypename),
            subSearchDepth: search.subSearchDepth + 1,
            start() {},
            relation(rel: Relation) {
                
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

    async runSave(set: SetOperation) {
        throw new Error("can't save on a derived value");
    }
}

export function mountDerivedTag(graph: Graph, pattern: string, keyTag: string, callback: DeriveFunc) {
}
