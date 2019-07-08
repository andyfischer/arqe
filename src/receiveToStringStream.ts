
import Tuple from './Tuple'
import Stream from './Stream'
import stringifyRelationStream from './stringifyRelationStream'

export default function receiveToStringStream(onStr: (s: string) => void): Stream {
    const stringifier = stringifyRelationStream();

    return {
        next(rel: Tuple) { 
            const str = stringifier(rel);
            if (str)
                onStr(str);
        },

        done() {
            onStr('#done');
        }
    }
}
