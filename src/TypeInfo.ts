
import { randomHex } from './utils'

export default class TypeInfo {
    everyValue = {}

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
