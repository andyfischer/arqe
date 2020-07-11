
import Tuple, { tagsToTuple } from './Tuple'
import Pattern from './Pattern'
import PatternTag, { newTag } from './TupleTag'
import Stream from './Stream'
import Command from './Command'

export function emitCommandMeta(output: Stream, fields: any) {
    const tags = [
        newTag('command-meta')
    ];

    for (const k in fields) {
        tags.push(newTag(k, fields[k]));
    }

    output.next(tagsToTuple(tags));
}

export function emitCommandError(output: Stream, message: any) {

    const tags = [
        newTag('command-meta'),
        newTag('error'),
        newTag('message', message)
    ];

    output.next(tagsToTuple(tags));
}

export function emitSearchPatternMeta(pattern: Pattern, output: Stream) {
    output.next(pattern.addTags(['command-meta', 'search-pattern']));
}

export function emitActionPerformed(output: Stream) {
    emitCommandMeta(output, { 'action-performed': true })
}

export function emitCommandOutputFlags(command: Command, output: Stream) {
    if (command.flags.exists)
        emitCommandMeta(output, { 'output-flag': 'exists' })
    if (command.flags.count)
        emitCommandMeta(output, { 'output-flag': 'count' })
    if (command.flags.x)
        emitCommandMeta(output, { 'output-flag': 'extended' })
    if (command.flags.list)
        emitCommandMeta(output, { 'output-flag': 'list' })
}

export function emitTupleDeleted(pattern: Pattern, output: Stream) {
    const rel = pattern.addTags(['command-meta', 'deleted']);
    output.next(rel);
}
