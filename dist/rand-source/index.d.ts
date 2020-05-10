export interface RandSource {
    nextScalar: () => number;
    nextInteger: (max: number) => number;
    shuffleArray: (array: any[]) => void;
}
export declare function standardRandSource(): RandSource;
