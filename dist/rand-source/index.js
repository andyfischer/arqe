"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StandardRandSource {
    nextScalar() {
        return Math.random();
    }
    nextInteger(max) {
        return Math.floor(this.nextScalar() * (max));
    }
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const toIndex = this.nextInteger(i + 1);
            const temp = array[i];
            array[i] = array[toIndex];
            array[toIndex] = temp;
        }
    }
}
function standardRandSource() {
    return new StandardRandSource();
}
exports.standardRandSource = standardRandSource;
//# sourceMappingURL=index.js.map