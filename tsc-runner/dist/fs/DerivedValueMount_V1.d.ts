import Graph from './Graph';
import StorageProvider from './StorageProvider';
import SetOperation from './SetOperation';
import RelationPattern from './RelationPattern';
import RelationSearch from './RelationSearch';
import UpdateContext from './UpdateContext';
declare type DeriveFunc = (cxt: UpdateContext, rel: RelationPattern) => any;
export default class DerivedValueMount implements StorageProvider {
    graph: Graph;
    mountTypename: string;
    callback: DeriveFunc;
    constructor(graph: Graph, callback: DeriveFunc, mountTypename: string);
    runSearch(search: RelationSearch): void;
    runSave(set: SetOperation): Promise<void>;
}
export declare function mountDerivedTag(graph: Graph, patternStr: string, keyTag: string, callback: DeriveFunc): void;
export {};
