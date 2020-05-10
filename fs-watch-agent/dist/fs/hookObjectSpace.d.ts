import Graph from './Graph';
import RelationSearch from './RelationSearch';
import Relation from './Relation';
import RelationReceiver from './RelationReceiver';
export declare function hookObjectSpaceSearch(graph: Graph, search: RelationSearch): boolean;
export declare function hookObjectSpaceSave(graph: Graph, rel: Relation, output: RelationReceiver): boolean;
