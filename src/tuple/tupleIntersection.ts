import Tuple from "../Tuple"
import TupleTag from "../TupleTag"

export default function tupleIntersection(lhs: Tuple, rhs: Tuple) {
    return lhs.remapTags((lhsTag: TupleTag) => {
        if (lhsTag.doubleStar) {
            if (rhs.derivedData().hasDoubleStar)
                return lhsTag;
            else
                return null;
        }

        if (lhsTag.hasValue()) {
            return lhsTag;
        }

        if (!lhsTag.attr)
            return lhsTag;

        const rhsTag = rhs.getTag(lhsTag.attr);

        if (!rhsTag)
            return null;

        if (rhsTag.hasValue())
            return rhsTag;

        if (lhsTag.optional && !rhsTag.optional)
            return rhsTag;

        return lhsTag;
    })
}