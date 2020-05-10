import Relation from './Relation';
import Pattern from './Pattern';
export default interface GraphListener {
    onRelationUpdated: (rel: Relation) => void;
    onRelationDeleted: (rel: Relation) => void;
}
export declare class GraphListenerMount {
    listener: GraphListener;
    pattern: Pattern;
}
