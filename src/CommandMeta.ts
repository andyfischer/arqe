
import Relation from './Relation'
import Pattern, { commandTagsToRelation } from './Pattern'
import PatternTag, { newTag } from './PatternTag'
import RelationReceiver from './RelationReceiver'

export function emitCommandMeta(output: RelationReceiver, fields: any) {
    const tags = [
        newTag('command-meta')
    ];

    for (const k in fields) {
        tags.push(newTag(k, fields[k]));
    }

    output.relation(commandTagsToRelation(tags, null));
}

export function emitCommandError(output: RelationReceiver, msg: string) {

    const tags = [
        newTag('command-meta'),
        newTag('error')
    ];

    output.relation(commandTagsToRelation(tags, msg));
}

export function emitSearchPatternMeta(pattern: Pattern, output: RelationReceiver) {

    let metaPattern = pattern.copy()
        .addTag('command-meta')
        .addTag('search-pattern');
    output.relation(metaPattern);
}

export function emitActionPerformed(output: RelationReceiver) {
    emitCommandMeta(output, { 'action-performed': true })
}
