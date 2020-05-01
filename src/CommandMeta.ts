
import Relation from './Relation'
import Pattern, { commandTagsToRelation } from './Pattern'
import PatternTag, { newTag } from './PatternTag'
import RelationReceiver from './RelationReceiver'
import Command from './Command'

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
        newTag('error'),
        newTag('message', msg)
    ];

    output.relation(commandTagsToRelation(tags, null));
}

export function emitSearchPatternMeta(pattern: Pattern, output: RelationReceiver) {
    output.relation(pattern.addTags(['command-meta', 'search-pattern']));
}

export function emitActionPerformed(output: RelationReceiver) {
    emitCommandMeta(output, { 'action-performed': true })
}

export function emitCommandOutputFlags(command: Command, output: RelationReceiver) {
    if (command.flags.exists)
        emitCommandMeta(output, { 'output-flag': 'exists' })
    if (command.flags.count)
        emitCommandMeta(output, { 'output-flag': 'count' })
    if (command.flags.x)
        emitCommandMeta(output, { 'output-flag': 'extended' })
    if (command.flags.list)
        emitCommandMeta(output, { 'output-flag': 'list' })
}

export function emitRelationDeleted(pattern: Pattern, output: RelationReceiver) {
    const rel = pattern.addTags(['command-meta', 'deleted']);
    output.relation(rel);
}
