import Relation from "./Relation";

export default function relationToObject(rel: Relation) {
    return rel.tuples.map(t => t.toObject());
}