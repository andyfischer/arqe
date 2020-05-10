import Graph from './Graph';
import Relation from './Relation';
import StorageProvider from './StorageProvider';
import Pattern from './Pattern';
import RelationSearch from './RelationSearch';
import UpdateContext from './UpdateContext';
import RelationReceiver from './RelationReceiver';
declare type DeriveFunc = (cxt: UpdateContext, rel: Pattern) => any;
export default class DerivedValueMount implements StorageProvider {
    graph: Graph;
    mountTypename: string;
    callback: DeriveFunc;
    constructor(graph: Graph, callback: DeriveFunc, mountTypename: string);
    runSearch(search: RelationSearch): void;
    runSave(rel: Relation, output: RelationReceiver): Promise<void>;
}
export declare function mountDerivedTag(graph: Graph, patternStr: string, keyTag: string, callback: DeriveFunc): void;
export {};
