
import { randomHex } from './utils'

export default class TagType {
    name: string
    everyValue = {}

    // options
    inherits: boolean

    constructor(name: string) {
        this.name = name;
    }

    getUniqueId() {
        let attempts = 0;

        while (attempts < 100) {
            const id = randomHex(5);
            if (this.everyValue[id])
                continue;

            return id;
        }

        throw new Error('failed to generate a unique ID');
    }
}
