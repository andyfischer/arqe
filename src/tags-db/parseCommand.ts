
import { parseAsOneSimple } from '../parse-query/parseQueryV3'
import Command, { CommandArg } from './Command'

export default function parseCommand(str: string): Command {
    const clauses = str.split(/ +/)
    const command = clauses[0];
    const argStrs = clauses.slice(1);
    const args = argStrs
        .map(str => {
            let tagType;
            let tagValue;
            let subtract;
            let star;

            const slashPos = str.indexOf('/');

            if (slashPos !== -1) {
                tagType = str.substring(0, slashPos);
                tagValue = str.substring(slashPos + 1)

            } else {
                tagType = str;
                tagValue = null;
            }

            if (tagType[0] === '-') {
                tagType = tagType.substring(1);
                subtract = true;
            }

            star = tagValue === '*';

            return {
               tagType,
               tagValue,
               subtract,
               star
            };
        });

    args.sort((a, b) => {
        return a.tagType.localeCompare(b.tagType);
    });

    const parsed = new Command();
    parsed.command = command;
    parsed.args = args;

    return parsed;
}

export function commandArgsToString(args: CommandArg[]) {
    return args.map(arg => {
        let s = arg.tagType;

        if (arg.tagValue) {
            s += '/' + arg.tagValue;
        } else if (arg.star) {
            s += '*';
        }

        return s;
    }).join(' ');
}

export function parseAsSave(str: string) {
    const command = parseCommand(str);

    if (command.command !== 'save')
        throw new Error("Expected 'save' command: " + str);

    return command.args;
}

export function normalizeExactTag(args: CommandArg[]) {
    const argStrs = args.map(arg => arg.tagType + '/' + arg.tagValue)
    argStrs.sort();
    return argStrs.join(' ');
}
