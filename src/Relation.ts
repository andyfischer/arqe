import Tuple, { singleTagToTuple } from "./Tuple"
import Stream from "./Stream"
import { Graph } from "."
import get from "./commands/get"

export default class Relation {
    header: Tuple
    tuples: Tuple[] = []
    errors: Tuple[] = []
}

export function receiveToRelation(out: Stream, attrName: string): Stream {
    const relation = new Relation();

    return {
        next(t) {
            if (t.isCommandMeta()) {
                if (t.isCommandError())
                    relation.errors.push(t);
                else if (t.isCommandSearchPattern())
                    relation.header = t;
            } else {
                relation.tuples.push(t);
            }
        },
        done() {
            out.next(singleTagToTuple(attrName, relation));
            out.done();
        }
    }
}

export function getRelation(graph: Graph, searchPattern: Tuple, out: Stream, attrName: string) {
    get(graph, searchPattern, receiveToRelation(out, attrName));
}