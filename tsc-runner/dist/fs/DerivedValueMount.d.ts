import Graph from './Graph';
import StorageProvider from './StorageProvider';
import SetOperation from './SetOperation';
import RelationSearch from './RelationSearch';
import UpdateContext from './UpdateContext';
declare type SearchCallback = (cxt: UpdateContext, search: RelationSearch) => void;
export default class DerivedValueMount implements StorageProvider {
    graph: Graph;
    callback: SearchCallback;
    constructor(graph: Graph, callback: SearchCallback);
    runSearch(search: RelationSearch): void;
    runSave(set: SetOperation): Promise<void>;
}
export declare function mountDerivedTag(graph: Graph, patternStr: string, callback: SearchCallback): void;
export {};
