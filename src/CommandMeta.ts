
import Tuple, { tagsToTuple } from './Tuple'
import TupleTag, { newTag, newSimpleTag } from './TupleTag'
import Stream from './Stream'
import Query from './Query'

const commandMetaTag = newSimpleTag('command-meta')
const searchPatternTag = newSimpleTag('search-pattern')

export function emitCommandMeta(output: Stream, fields: any) {
    const tags = [
        commandMetaTag
    ];

    for (const k in fields) {
        tags.push(newTag(k, fields[k]));
    }

    output.next(tagsToTuple(tags));
}

export function emitCommandError(output: Stream, message: any) {

    const tags = [
        commandMetaTag,
        newTag('error'),
        newTag('message', message)
    ];

    output.next(tagsToTuple(tags));
}

export function emitSearchPatternMeta(pattern: Tuple, output: Stream) {
    output.next(pattern.addTags([commandMetaTag, searchPatternTag]));
}

export function emitActionPerformed(output: Stream) {
    emitCommandMeta(output, { 'action-performed': true })
}

export function emitCommandOutputFlags(command: Query, output: Stream) {
    if (command.flags.exists)
        emitCommandMeta(output, { 'output-flag': 'exists' })
    if (command.flags.count)
        emitCommandMeta(output, { 'output-flag': 'count' })
    if (command.flags.x)
        emitCommandMeta(output, { 'output-flag': 'extended' })
    if (command.flags.list)
        emitCommandMeta(output, { 'output-flag': 'list' })
}

export function emitTupleDeleted(tuple: Tuple, output: Stream) {
    const rel = tuple.addTags([commandMetaTag, newSimpleTag('deleted')]);
    output.next(rel);
}
