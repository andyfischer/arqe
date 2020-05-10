import Relation from './Relation';
import Pattern from './Pattern';
export default interface GraphListenerV3 {
    onRelationCreated: (rel: Relation) => void;
    onRelationUpdated: (rel: Relation) => void;
    onRelationDeleted: (rel: Relation) => void;
}
export declare class GraphListenerMountV3 {
    listener: GraphListenerV3;
    pattern: Pattern;
}
