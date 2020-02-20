
import Relation from './Relation'
import RelationPattern, { commandTagsToRelation } from './RelationPattern'
import RelationReceiver from './RelationReceiver'

export function emitCommandMeta(output: RelationReceiver, fields: any) {
    const tags = [
        {tagType: 'command-meta', tagValue: null}
    ];

    for (const k in fields) {
        tags.push({tagType: k, tagValue: fields[k]});
    }

    output.relation(commandTagsToRelation(tags, null));
}

export function emitMetaInfoForUnboundVars(pattern: RelationPattern, output: RelationReceiver) {
    for (const tag of pattern.tags) {
        if (tag.unboundType) {
            emitCommandMeta(output, { unboundType: null, var: tag.unboundType });
        }

        if (tag.unboundValue) {
            emitCommandMeta(output, { unboundValue: null, 'type': tag.tagType, var: tag.unboundValue });
        }
    }
}
