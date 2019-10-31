
export interface RandSource {
    nextScalar: () => number
    nextInteger: (max: number) => number
    shuffleArray: (array: any[]) => void
}

class StandardRandSource {
    nextScalar() {
        return Math.random()
    }

    nextInteger(max: number) {
        return Math.floor(this.nextScalar() * (max))
    }

    shuffleArray(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const toIndex = this.nextInteger(i + 1);

            const temp = array[i];
            array[i] = array[toIndex];
            array[toIndex] = temp;
        }
    }
}

export function standardRandSource(): RandSource {
    return new StandardRandSource();
}

