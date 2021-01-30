
import parseCommand from './parseCommand'
import Tag, { newTag } from './Tag'

export function appendTagInCommand(str: string, tag: string) {
    const parsed = parseCommand(str);
    parsed.tuple = parsed.tuple.addTag(newTag(tag));
    return parsed.stringify();
}

export function parseAsSet(str: string) {
    const command = parseCommand(str);

    if (command.verb !== 'set')
        throw new Error("Expected 'set' command: " + str);

    return command.tuple.tags;
}

export function normalizeExactTag(tags: Tag[]) {
    const argStrs = tags.map(arg => arg.attr + '/' + arg.value)
    argStrs.sort();
    return argStrs.join(' ');
}

