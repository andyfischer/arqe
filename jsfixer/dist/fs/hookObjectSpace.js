"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Pattern_1 = require("./Pattern");
const parseExpr_1 = require("./parseExpr");
const CommandMeta_1 = require("./CommandMeta");
function findObjectType(graph, pattern) {
    for (const tag of pattern.tags) {
        const columnName = pattern.tags[0].tagType;
        if (graph.objectTypes.hasColumn(columnName))
            return columnName;
    }
    return null;
}
function runObjectStarSearch(graph, search, columnTag, objectSpace) {
    const filters = [];
    const attrsToInclude = [];
    for (const tag of search.pattern.tags) {
        if (tag.tagType === columnTag.tagType)
            continue;
        attrsToInclude.push(tag.tagType);
        if (tag.starValue)
            continue;
        filters.push((obj) => {
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
        const map = new Map();
        for (const attr of attrsToInclude)
            map.set(attr, obj.attrs[attr]);
        map.set(columnTag.tagType, obj.id);
        const rel = Pattern_1.patternFromMap(map);
        search.relation(rel);
    }
    search.finish();
}
function hookObjectSpaceSearch(graph, search) {
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
    const tags = search.pattern.tags;
    if (tags.length === 1) {
        const columnName = tags[0].tagType;
        if (objectSpace.hasObject(tags[0].tagValue)) {
            search.relation(search.pattern);
        }
        search.finish();
        return true;
    }
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
    return true;
}
exports.hookObjectSpaceSearch = hookObjectSpaceSearch;
function hookObjectSpaceSave(graph, rel, output) {
    const columnName = findObjectType(graph, rel);
    if (!columnName)
        return false;
    const objectSpace = graph.objectTypes.column(columnName);
    if (rel.tags.length === 1) {
        let tag = rel.tags[0];
        if (tag.valueExpr && tag.valueExpr.length === 1 && tag.valueExpr[0] === 'unique') {
            rel = rel.updateTagAtIndex(0, tag => tag.setValue(objectSpace.nextId()));
            tag = rel.tags[0];
        }
        if (tag.valueExpr) {
            CommandMeta_1.emitCommandError(output, "unexpected expression: " + parseExpr_1.stringifyExpr(tag.valueExpr));
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
    for (const tag of rel.tags) {
        if (tag.tagType === columnName)
            continue;
        const tagType = tag.tagType;
        if (!objectSpace.attributes.has(tagType)) {
            CommandMeta_1.emitCommandError(output, `object type '${columnName}' has no attribute '${tagType}'`);
            continue;
        }
        object.attrs[tag.tagType] = tag.tagValue;
    }
    output.relation(rel);
    output.finish();
    return true;
}
exports.hookObjectSpaceSave = hookObjectSpaceSave;
//# sourceMappingURL=hookObjectSpace.js.map