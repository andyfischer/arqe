
import CommandParams from './CommandParams'
import QueryContext from './QueryContext'
import { runGet } from './verbs/get'
import { joinNStreams_v2 } from './StreamUtil'
import Stream from './Stream'
import Tuple, { newTuple } from './Tuple'
import { newTag, newSimpleTag } from './TupleTag'
import { CommandFlags } from './Command'

const commandMetaTag = newSimpleTag('command-meta')
const searchPatternTag = newSimpleTag('search-pattern')

export function emitCommandMeta(output: Stream, fields: any) {
    const tags = [
        commandMetaTag
    ];

    for (const k in fields) {
        tags.push(newTag(k, fields[k]));
    }

    output.next(newTuple(tags));
}

export function emitCommandError(output: Stream, message: any) {

    const tags = [
        commandMetaTag,
        newTag('error'),
        newTag('message', message)
    ];

    output.next(newTuple(tags));
}

export function emitSearchPatternMeta(pattern: Tuple, output: Stream) {
    output.next(pattern.addTags([commandMetaTag, searchPatternTag]));
}

export function emitActionPerformed(output: Stream) {
    emitCommandMeta(output, { 'action-performed': true })
}

export function emitCommandOutputFlags(flags: CommandFlags, output: Stream) {
    if (flags.exists)
        emitCommandMeta(output, { 'output-flag': 'exists' })
    if (flags.count)
        emitCommandMeta(output, { 'output-flag': 'count' })
    if (flags.x)
        emitCommandMeta(output, { 'output-flag': 'extended' })
    if (flags.list)
        emitCommandMeta(output, { 'output-flag': 'list' })
}

export function emitTupleDeleted(tuple: Tuple, output: Stream) {
    const rel = tuple.addTags([commandMetaTag, newSimpleTag('deleted')]);
    output.next(rel);
}


export function getSearchAndInputCombined(cxt: QueryContext, params: CommandParams, out: Stream) {
    const joined = joinNStreams_v2(2, out);
    params.input.sendTo(joined);
    runGet(cxt, params.tuple, joined);
}
