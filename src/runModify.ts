
import Graph from './Graph'
import Pattern from './Pattern'
import Relation from './Relation'
import RelationReceiver from './RelationReceiver'
import runSearch from './runSearch'
import { relationSearchFromPattern } from './RelationSearch'
import runDelete from './runDelete'

export interface ModifyRequest {
    graph: Graph
    pattern: Pattern
    output: RelationReceiver
}

function translateValueWithExpr(value: string, expr: string[]) {
    const func = expr[0];
    if (func === 'increment')
        return (parseInt(value, 10) + 1) + '';

    throw new Error('Unrecognized expression: ' + func);
}

function modifyWithPattern(rel: Relation, pattern: Pattern): Relation {
    for (const tag of rel.tags) {
        const patternTag = pattern.findTagWithType(tag.tagType);
        if (patternTag.valueExpr) {
            const update = tag => tag.setValue(translateValueWithExpr(tag.tagValue, patternTag.valueExpr))
            rel = rel.updateTagOfType(tag.tagType, update);
        }
    }

    return rel;
}

export default function runModify(modify: ModifyRequest) {
    const { graph, pattern } = modify;

    const exprTags = pattern.tags.filter(t => !!t.valueExpr);
    if (exprTags.length === 0)
        throw new Error('expected an expression tag value: ' + pattern.stringify());

    let isDone = false;

    function foundRelation(rel: Relation) {
        const updated = modifyWithPattern(rel, pattern);

        runDelete(graph, rel, {
            relation(rel) {},
            isDone() { return false },
            finish() {
                if (isDone)
                    console.error('warning: out of order in runModify');
            }
        });


    }

    runSearch(graph, relationSearchFromPattern(pattern, {
        relation: foundRelation,
        isDone: () => modify.output.isDone(),
        finish: () => modify.output.finish()
    }));

}

// modify file-watch filename/xyz last-version/(increment)
