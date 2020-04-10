
import Graph from './Graph'
import RelationSearch from './RelationSearch'
import CommandStep from './CommandStep'
import Relation from './Relation'
import RelationReceiver from './RelationReceiver'

export function hookObjectSpaceSearch(graph: Graph, search: RelationSearch) {
    // Check object space - #exists
    const tags = search.pattern.tags;
    if (tags.length === 1) {
        const columnName = tags[0].tagType;
        if (graph.objectTypes.hasColumn(columnName)) {
            if (graph.objectTypes.column(columnName).hasObject(tags[0].tagValue)) {
                search.relation(search.pattern);
            }
            search.finish();
            return true;
        }
    }

    // Check object space - attribute fetch
    if (tags.length === 2) {
        for (let tagIndex=0; tagIndex < 2; tagIndex++) {
            const columnName = tags[tagIndex].tagType;
            if (graph.objectTypes.hasColumn(columnName)) {
                const otherTagIndex = (tagIndex === 0) ? 1 : 0;
                const object = graph.objectTypes
                    .column(columnName)
                    .object(tags[tagIndex].tagValue);

                const attrName = tags[otherTagIndex].tagType;
                if (object.attrs[attrName]) {
                    search.relation(search.pattern.setTagValueAtIndex(otherTagIndex, object.attrs[attrName]));
                }
                search.finish();
                return true;
            }
        }
    }
}

export function hookObjectSpaceSave(graph: Graph, rel: Relation, output: RelationReceiver) {
    // Check object space - object definition
    const tags = rel.tags;

    if (tags.length === 1) {
        const columnName = tags[0].tagType;
        if (graph.objectTypes.hasColumn(columnName)) {
            graph.objectTypes.column(columnName).createObject(tags[0].tagValue);
            output.relation(rel);
            output.finish();
            return true;
        }
    }

    // Check object space - attribute assignment
    if (tags.length === 2) {
        for (let tagIndex=0; tagIndex < 2; tagIndex++) {
            const columnName = tags[tagIndex].tagType;
            if (graph.objectTypes.hasColumn(columnName)) {
                const otherTagIndex = (tagIndex === 0) ? 1 : 0;
                const object = graph.objectTypes
                    .column(columnName)
                    .createObject(tags[tagIndex].tagValue);

                object.attrs[tags[otherTagIndex].tagType] = tags[otherTagIndex].tagValue;
                output.relation(rel);
                output.finish();
                return true;
            }
        }
    }
}
