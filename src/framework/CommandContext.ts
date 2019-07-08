
import { Query } from '../query'
import { Snapshot } from '../snapshot'
import { runCommand } from '.'

export default class CommandContext {
    query: Query
    snapshot: Snapshot
    results: { [key: string]: string } = {}

    async get(valueName: string) {

        if (this.query) {
            const options = this.query.options;

            if (options[valueName] != null)
                return options[valueName];
        }

        const get = this.snapshot.getValueOpt(valueName);
        if (get.found)
            return get.found;

        throw new Error("CommandContext.get missing value for: " + valueName);
    }

    async subQuery(queryStr: string) {
    }
}
