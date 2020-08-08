
import Query from './Query'

export default class CompoundQuery {
    queries: Query[];

    constructor(commands: Query[] = []) {
        this.queries = commands;
    }

    stringify() {
        return this.queries.map(c => c.stringify()).join(' | ');
    }
}
