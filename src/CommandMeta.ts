
import Relation from './Relation'
import Pattern, { commandTagsToRelation } from './Pattern'
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

export function emitCommandError(output: RelationReceiver, msg: string) {
    const tags = [
        {tagType: 'command-meta', tagValue: null},
        {tagType: 'error', tagValue: null}
    ];

    output.relation(commandTagsToRelation(tags, msg));
}

export function emitMetaInfoForUnboundVars(pattern: Pattern, output: RelationReceiver) {
    for (const tag of pattern.tags) {

        if (tag.tagType && tag.identifier) {
            emitCommandMeta(output, { unboundValue: null, 'type': tag.tagType, var: tag.identifier });
        } else if (tag.identifier) {
            emitCommandMeta(output, { unboundType: null, var: tag.identifier });
        }
    }
}
