
import Tuple, { tagsToPattern } from './Tuple'
import Pattern from './Pattern'
import PatternTag, { newTag } from './PatternTag'
import TupleReceiver from './TupleReceiver'
import Command from './Command'

export function emitCommandMeta(output: TupleReceiver, fields: any) {
    const tags = [
        newTag('command-meta')
    ];

    for (const k in fields) {
        tags.push(newTag(k, fields[k]));
    }

    output.relation(tagsToPattern(tags));
}

export function emitCommandError(output: TupleReceiver, msg: string) {

    const tags = [
        newTag('command-meta'),
        newTag('error'),
        newTag('message', msg)
    ];

    output.relation(tagsToPattern(tags));
}

export function emitSearchPatternMeta(pattern: Pattern, output: TupleReceiver) {
    output.relation(pattern.addTags(['command-meta', 'search-pattern']));
}

export function emitActionPerformed(output: TupleReceiver) {
    emitCommandMeta(output, { 'action-performed': true })
}

export function emitCommandOutputFlags(command: Command, output: TupleReceiver) {
    if (command.flags.exists)
        emitCommandMeta(output, { 'output-flag': 'exists' })
    if (command.flags.count)
        emitCommandMeta(output, { 'output-flag': 'count' })
    if (command.flags.x)
        emitCommandMeta(output, { 'output-flag': 'extended' })
    if (command.flags.list)
        emitCommandMeta(output, { 'output-flag': 'list' })
}

export function emitTupleDeleted(pattern: Pattern, output: TupleReceiver) {
    const rel = pattern.addTags(['command-meta', 'deleted']);
    output.relation(rel);
}
