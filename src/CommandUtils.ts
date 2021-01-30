
import CommandParams from './CommandParams'
import QueryContext from './QueryContext'
import { joinNStreams_v2 } from './StreamUtil'
import Stream from './Stream'
import Tuple, { newTuple, isTuple } from './Tuple'
import { newTag, newSimpleTag } from './Tag'
import { CommandFlags } from './Command'

const errorTag  = newSimpleTag('error')
const errorCodeTag  = newSimpleTag('error-code')
const messageTag  = newSimpleTag('message')
const verbTag  = newSimpleTag('verb')
const stackTag  = newSimpleTag('stack')
const commandMetaTag  = newSimpleTag('command-meta')
const searchPatternTag = newSimpleTag('search-pattern')
const patternTag = newSimpleTag('pattern')

export function emitCommandMeta(output: Stream, fields: any) {
    const tags = [
        commandMetaTag
    ];

    for (const k in fields) {
        tags.push(newTag(k, fields[k]));
    }

    output.next(newTuple(tags));
}

export function jsErrorToTuple(err: any) {
    if (isTuple(err))
        return err;

    const tags = [
        errorTag,
        messageTag.setValue(err.message !== undefined ? err.message : ''+err)
    ];

    if (err.stack)
        tags.push(stackTag.setValue(err.stack));

    return newTuple(tags);
}

export function errorMessage(message: string) {
    return newTuple([
        commandMetaTag,
        errorTag,
        messageTag.setValue(message)
    ]);
}

export function emitCommandError(output: Stream, err: any) {

    let t = jsErrorToTuple(err);

    if (!t.has(commandMetaTag.attr))
        t = t.addTag(commandMetaTag);

    output.next(t);
}

export function emitSearchPatternMeta(pattern: Tuple, output: Stream) {
    output.next(pattern.addTags([commandMetaTag, searchPatternTag]));
}

export function emitActionPerformed(output: Stream) {
    emitCommandMeta(output, { 'action-performed': true })
}

export function emitCommandOutputFlags(flags: CommandFlags, output: Stream) {
    if (!flags)
        return;

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

export function asCommandMeta(tuple: Tuple) {
    return tuple.addTag(commandMetaTag);
}

export function tableNotFoundError(pattern: Tuple) {
    return newTuple([
        commandMetaTag,
        errorTag,
        errorCodeTag.setValue('table-not-found'),
        messageTag.setValue("No table found for pattern: " + pattern.stringify()),
        patternTag.setValue(pattern)
    ]);
}

export function tableDoesntSupportOperation(verb: string, pattern: Tuple) {
    return newTuple([
        commandMetaTag,
        errorTag,
        errorCodeTag.setValue('table-doesnt-support-operation'),
        messageTag.setValue("Table doesn't support this access: " + pattern.stringify()),
        verbTag.setValue(verb),
        patternTag.setValue(pattern)
    ]);
}
