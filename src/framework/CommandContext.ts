
import { Query } from '../query'
import { Snapshot } from '../framework'
import { runCommand } from '.'

export default class CommandContext {
    query: Query
    snapshot: Snapshot
    incoming: { [key: string]: string } = {}
    results: { [key: string]: string } = {}

    get(valueName: string) {

        if (this.incoming[valueName])
            return this.incoming[valueName];

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

    set(valueName: string, value: any) {
        this.snapshot[valueName] = value;
    }

    async subQuery(queryStr: string) {
    }
}
