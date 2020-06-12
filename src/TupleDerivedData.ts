
import Tuple from './Tuple'

export default class TupleDerivedData {

    hasSingleStar: boolean
    hasDoubleStar: boolean
    hasAnyStars: boolean

    constructor(tuple: Tuple) {

        this.hasSingleStar = false;
        this.hasDoubleStar = false;
        this.hasAnyStars = false;

        for (const tag of tuple.tags) {
            if (tag.star)
                this.hasSingleStar = true;

            if (tag.doubleStar)
                this.hasDoubleStar = true;

            if (tag.star || tag.doubleStar || tag.starValue)
                this.hasAnyStars = true;
        }
    }
}

