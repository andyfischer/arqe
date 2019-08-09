
import CommandImplementation from '../types/CommandImplementation'

export const everyImplementation: { [name: string]: CommandImplementation } = {}

export default function implement(name: string, func: CommandImplementation) {
    if (everyImplementation[name])
        throw new Error('already have implementation for: ' + name);

    everyImplementation[name] = func;
}
