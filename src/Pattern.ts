
import parseCommand, { parseTag } from './parseCommand'
import Tuple from './Tuple'

type Pattern = Tuple;

export default Pattern;

export function parsePattern(query: string) {
    const parsed = parseCommand('get ' + query);
    return parsed.pattern;
}
