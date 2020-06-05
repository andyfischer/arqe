
import Tuple from './Tuple'
import TupleReceiver from './TupleReceiver'
import stringifyRelationStream from './stringifyRelationStream'

export default function receiveToStringStream(onStr: (s: string) => void): TupleReceiver {
    const stringifier = stringifyRelationStream();

    return {
        relation(rel: Tuple) { 
            const str = stringifier(rel);
            if (str)
                onStr(str);
        },

        finish() {
            onStr('#done');
        }
    }
}
