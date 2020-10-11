
import Graph from '../../Graph'

export interface ChaosMode {
    name: string
    shortDescription: string
    setupNewGraph?: (graph: Graph) => void
    modifyRunCommand?: (command: string) => string
}

// Modes to add:
//  - Enable specific optimizations

export function activeChaosModes() {
    return []

}
