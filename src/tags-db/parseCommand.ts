
import { parseAsOneSimple } from '../parse-query/parseQueryV3'

export interface ParsedArg {
    tagType: string
    tagValue: string
    star?: boolean
}

export interface ParsedCommand {
    command: string
    args: ParsedArg[]
}

export default function parseCommand(str: string): ParsedCommand {
    //const syntax = parseAsOneSimple(str);

    const clauses = str.split(/ +/)
    const command = clauses[0];
    const argStrs = clauses.slice(1);
    const args = argStrs
        .map(str => {
            const slashPos = str.indexOf('/');
            if (slashPos !== -1) {
                const tagType = str.substring(0, slashPos);
                const tagValue = str.substring(slashPos + 1)

                return {
                   tagType,
                   tagValue,
                   star: tagValue === '*'
                };
            }

            throw new Error('unrecognized arg: ' + str);
        })

    const parsed = {
        command,
        args
    }

    return parsed;
}
