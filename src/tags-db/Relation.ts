
import { CommandTag } from './Command'

export default class Relation {
    ntag: string
    payloadStr: any
    asMap: any = {}

    constructor(ntag: string, tags: CommandTag[], payloadStr: string) {
        this.ntag = ntag;
        this.payloadStr = payloadStr || '#exists';

        for (const arg of tags) {
            this.asMap[arg.tagType] = arg.tagValue || true;
        }
    }

    includesType(name: string) {
        return this.asMap[name] !== undefined;
    }
}
