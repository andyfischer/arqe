
import { CommandArg } from './Command'

export default class Relation {
    ntag: string
    value: any
    asMap: any = {}

    constructor(ntag: string, args: CommandArg[]) {
        this.ntag = ntag;

        for (const arg of args) {
            this.asMap[arg.tagType] = arg.tagValue || true;
        }
    }

    includesType(name: string) {
        return this.asMap[name] !== undefined;
    }
}
