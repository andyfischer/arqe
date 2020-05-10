import Relation from './Relation';
export default interface GraphListener {
    onRelationUpdated: (rel: Relation) => void;
    onRelationDeleted: (rel: Relation) => void;
    finish: () => void;
}
