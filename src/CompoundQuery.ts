
import ParsedQuery from './ParsedQuery'

export default class CompoundQuery {
    queries: ParsedQuery[];

    constructor(commands: ParsedQuery[] = []) {
        this.queries = commands;
    }

    stringify() {
        return this.queries.map(c => c.stringify()).join(' | ');
    }
}
