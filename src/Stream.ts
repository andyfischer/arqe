
import Tuple from './Tuple'
import Pipe from './Pipe'

export default interface Stream {
    next: (t: Tuple) => void
    done: () => void

    _pipe?: Pipe
    _addTracedInput?: (label: string, input: Pipe) => void
}

export function receiveToNull(): Stream {
    return {
        next(rel) {  },
        done() {  }
    }
}

export function streamMap(mapper: (Tuple) => Tuple|null, out: Stream) {
    return {
        next(t) {
            const mapped = mapper(t);
            if (mapped)
                out.next(mapped);
        },
        done() {
            out.done()
        }
    }
}
