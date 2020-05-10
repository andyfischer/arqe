import Graph from '../../Graph';
export interface ChaosMode {
    name: string;
    shortDescription: string;
    setupNewGraph?: (graph: Graph) => void;
    modifyRunCommand?: (command: string) => string;
}
export declare const ReparseCommand: ChaosMode;
export declare const InsertExtraTag: ChaosMode;
export declare const GetInheritedBranch: ChaosMode;
export declare const ScrambleTagOrder: ChaosMode;
export declare function activeChaosModes(): ChaosMode[];
