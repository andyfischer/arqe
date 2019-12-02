
import { CommandTag } from './Command'

export default class Relation {
    ntag: string
    value: any
    asMap: any = {}

    constructor(ntag: string, tags: CommandTag[]) {
        this.ntag = ntag;

        for (const arg of tags) {
            this.asMap[arg.tagType] = arg.tagValue || true;
        }
    }

    includesType(name: string) {
        return this.asMap[name] !== undefined;
    }
}
