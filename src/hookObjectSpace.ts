
import Graph from './Graph'
import RelationSearch from './RelationSearch'
import CommandStep from './CommandStep'
import Relation from './Relation'
import Pattern from './Pattern'
import RelationReceiver from './RelationReceiver'
import { stringifyExpr } from './parseExpr'
import { emitCommandError } from './CommandMeta'

function findObjectType(graph: Graph, pattern: Pattern) {
    for (const tag of pattern.tags) {
        const columnName = pattern.tags[0].tagType;
        if (graph.objectTypes.hasColumn(columnName))
            return columnName;
    }

    return null;
}

export function hookObjectSpaceSearch(graph: Graph, search: RelationSearch) {

    const columnName = findObjectType(graph, search.pattern);
    if (!columnName)
        return false;

    const objectSpace = graph.objectTypes.column(columnName);
    const columnTag = search.pattern.findTagWithType(columnName);
    const object = objectSpace.getExistingObject(columnTag.tagValue);

    if (!object) {
        search.finish();
        return true;
    }

    // Check object space - #exists
    const tags = search.pattern.tags;
    if (tags.length === 1) {
        const columnName = tags[0].tagType;
        if (objectSpace.hasObject(tags[0].tagValue)) {
            search.relation(search.pattern);
        }
        search.finish();
        return true;
    }

    // Check object space - attribute fetch
    let outRelation = search.pattern;

    for (const tag of tags) {
        if (tag.tagType === columnName)
            continue;

        const attr = tag.tagType;

        if (tag.starValue) {
            outRelation = outRelation.updateTagOfType(attr, tag => tag.setValue(object.attrs[attr]));
        }
    }

    search.relation(outRelation);
    search.finish();

    //emitCommandError(search, `don't know how to get relation from '${columnName}' object type`);
    //search.finish();
    return true;
}

export function hookObjectSpaceSave(graph: Graph, rel: Relation, output: RelationReceiver) {

    const columnName = findObjectType(graph, rel);
    if (!columnName)
        return false;

    const objectSpace = graph.objectTypes.column(columnName)

    // Object definition
    if (rel.tags.length === 1) {
        let tag = rel.tags[0];

        if (tag.valueExpr && tag.valueExpr.length === 1 && tag.valueExpr[0] === 'unique') {
            rel = rel.updateTagAtIndex(0, tag => tag.setValue(objectSpace.nextId()));
            tag = rel.tags[0];
        }

        if (tag.valueExpr) {
            emitCommandError(output, "unexpected expression: " + stringifyExpr(tag.valueExpr));
            output.finish();
            return true;
        }

        objectSpace.createObject(tag.tagValue);
        output.relation(rel);
        output.finish();
        return true;
    }

    const columnTag = rel.findTagWithType(columnName);
    const object = objectSpace.createObject(columnTag.tagValue);

    // Attribute assignment
    for (let tagIndex=0; tagIndex < rel.tags.length; tagIndex++) {
        const tag = rel.tags[tagIndex];
        if (tag.tagType === columnName)
            continue;

        const tagType = tag.tagType;

        if (!objectSpace.attributes[tagType]) {
            emitCommandError(output, `object type '${columnName}' has no attribute '${tagType}'`);
            continue;
        }

        object.attrs[tag.tagType] = tag.tagValue;
    }

    output.finish();
    return true;
}
