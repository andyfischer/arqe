import Graph from '../../Graph';
export default interface ChaosMode {
    name: string;
    shortDescription: string;
    setupNewGraph?: (graph: Graph) => void;
    modifyRunCommand?: (command: string) => string;
}
