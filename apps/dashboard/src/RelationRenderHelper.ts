
import { Relation, Tuple } from 'arqe'

export default class RelationRenderHelper {
    relation: Relation
    header: Tuple

    constructor(relation: Relation) {
        this.relation = relation;
        this.header = relation.getOrInferHeader()
    }

    rowCount() {
        return this.relation.tuples.length;
    }

    columnCount() {
        return this.header.tags.length;
    }

    headerTags() {
        return this.header.tags.map((tag, index) => {
            return { tag,
                col: index + 1,
                firstCol: index == 0,
                lastCol: index == this.header.tags.length - 1,
                key: 'header-' + index
            }
        })
    }

    bodyTags() {
        const out: { row, col, tag, firstCol, key }[] = [];
        this.relation.getTuplesSortedByHeader().map((tuple, tupleIndex) => {
            tuple.tags.map((tag, tagIndex) => {
                out.push({
                    firstCol: tagIndex == 0,
                    row: tupleIndex + 1,
                    col: tagIndex + 1,
                    tag,
                    key: `body-${tupleIndex}-${tagIndex}`
                });
            });
        });
        return out;
    }
}
