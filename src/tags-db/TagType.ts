
import { randomHex } from '../utils'

export default class TagType {
    name: string
    everyValue = {}

    constructor(name: string) {
        this.name = name;
    }

    getUniqueId() {
        let attempts = 0;

        while (attempts < 100) {
            const check = randomHex(5);
            if (this.everyValue[check])
                return check;

            return check;
        }

        throw new Error('failed to generate a unique ID');
    }
}
