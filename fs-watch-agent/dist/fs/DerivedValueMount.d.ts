import Graph from './Graph';
import Relation from './Relation';
import StorageProvider from './StorageProvider';
import RelationSearch from './RelationSearch';
import UpdateContext from './UpdateContext';
import RelationReceiver from './RelationReceiver';
declare type SearchCallback = (cxt: UpdateContext, search: RelationSearch) => void;
export default class DerivedValueMount implements StorageProvider {
    graph: Graph;
    callback: SearchCallback;
    constructor(graph: Graph, callback: SearchCallback);
    runSearch(search: RelationSearch): void;
    runSave(rel: Relation, output: RelationReceiver): Promise<void>;
}
export declare function mountDerivedTag(graph: Graph, patternStr: string, callback: SearchCallback): void;
export {};
