
import Tuple from './Tuple'

export default interface Stream {
    next: (t: Tuple) => void
    done: () => void
}

export function receiveToNull(): Stream {
    return {
        next(rel) {  },
        done() {  }
    }
}
