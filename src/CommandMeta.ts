
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

export function emitSearchPatternMeta(pattern: Pattern, output: RelationReceiver) {

    // Only emit if the pattern has any identifiers.

    for (const tag of pattern.tags) {
        if (tag.identifier) {
            let metaPattern = pattern.copy()
                .addTag('command-meta')
                .addTag('search-pattern');
            output.relation(metaPattern);
            return
        }
    }
}
