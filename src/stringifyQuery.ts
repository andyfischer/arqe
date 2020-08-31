
import CompoundQuery from './CompoundQuery'
import parseCommand from './parseCommand'
import TupleTag, { newTag } from './TupleTag'

export function stringifyCommandChain(chain: CompoundQuery) {
    return chain.queries.map(command => command.stringify()).join(' | ');
}

export function appendTagInCommand(str: string, tag: string) {
    const parsed = parseCommand(str);
    parsed.pattern = parsed.pattern.addTag(newTag(tag));
    return parsed.stringify();
}

export function parseAsSet(str: string) {
    const command = parseCommand(str);

    if (command.verb !== 'set')
        throw new Error("Expected 'set' command: " + str);

    return command.pattern.tags;
}

export function normalizeExactTag(tags: TupleTag[]) {
    const argStrs = tags.map(arg => arg.attr + '/' + arg.value)
    argStrs.sort();
    return argStrs.join(' ');
}

