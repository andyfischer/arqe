
import Graph from './Graph'
import SearchOperation from './SearchOperation'
import CommandStep from './CommandStep'
import Relation from './Relation'
import Pattern, { patternFromMap } from './Pattern'
import RelationReceiver from './RelationReceiver'
import { stringifyExpr } from './parseExpr'
import { emitCommandError } from './CommandMeta'
import PatternTag from './PatternTag'
import ObjectSpace from './ObjectSpace'
import SaveSearchHook from './SaveSearchHook'

function findObjectType(graph: Graph, pattern: Pattern) {
    for (const tag of pattern.tags) {
        const columnName = pattern.tags[0].tagType;
        if (graph.objectTypes.hasColumn(columnName))
            return columnName;
    }

    return null;
}

function runObjectStarSearch(graph: Graph, search: SearchOperation, columnTag: PatternTag, objectSpace: ObjectSpace) {

    const filters = [];
    const attrsToInclude = [];

    for (const tag of search.pattern.tags) {

        if (tag.tagType === columnTag.tagType)
            continue;

        attrsToInclude.push(tag.tagType);

        if (tag.starValue)
            continue;

        filters.push((obj) => {
            //console.log(`checking ${tag.tagType} ${tag.tagValue} ${JSON.stringify(obj.attrs)}`);
            return obj.attrs[tag.tagType] === tag.tagValue;
        });
    }

    for (const obj of objectSpace.objects.values()) {

        let match = true;
        for (const filter of filters)
            if (!filter(obj))
                match = false;

        if (!match)
            continue;

        // Object matches
        const map = new Map();

        //console.log('this object matches: ', JSON.stringify(obj.attrs))

        for (const attr of attrsToInclude)
            map.set(attr, obj.attrs[attr]);

        map.set(columnTag.tagType, obj.id);

        //console.log('map = ', map);

        const rel = patternFromMap(map);
        //console.log('object space search found: ' + rel.stringify());
        search.relation(rel);
    }

    search.finish();
}

export function hookObjectSpaceSearch(search: SearchOperation): boolean {

    const graph = search.graph;

    const columnName = findObjectType(graph, search.pattern);
    if (!columnName)
        return false;

    const objectSpace = graph.objectTypes.column(columnName);
    const columnTag = search.pattern.findTagWithType(columnName);

    if (columnTag.starValue) {
        runObjectStarSearch(graph, search, columnTag, objectSpace);
        return true;
    }

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
    for (const tag of rel.tags) {
        if (tag.tagType === columnName)
            continue;

        const tagType = tag.tagType;

        if (!objectSpace.attributes.has(tagType)) {
            emitCommandError(output, `object type '${columnName}' has no attribute '${tagType}'`);
            continue;
        }

        object.attrs[tag.tagType] = tag.tagValue;
    }

    output.relation(rel);
    output.finish();
    return true;
}

export function getObjectSpaceHooks(): SaveSearchHook {
    return {
        hookSearch: hookObjectSpaceSearch,
        hookSave: hookObjectSpaceSave
    };
}

