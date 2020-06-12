
import Tuple from './Tuple'
import PatternTag from './PatternTag'

export default class TupleDerivedData {

    hasSingleStar: boolean
    hasDoubleStar: boolean
    hasAnyStars: boolean
    fixedTags: PatternTag[] = []
    fixedTagsForAttr = new Map<string,PatternTag>()

    sortedTags: PatternTag[]

    constructor(tuple: Tuple) {

        this.hasSingleStar = false;
        this.hasDoubleStar = false;
        this.hasAnyStars = false;

        for (const tag of tuple.tags) {
            if (tag.star)
                this.hasSingleStar = true;

            if (tag.doubleStar)
                this.hasDoubleStar = true;

            if (tag.star || tag.doubleStar || tag.starValue) {
                this.hasAnyStars = true;
            } else {
                if (!tag.attr)
                    throw new Error("internal data error: non-star tag should have 'attr'");
                this.fixedTags.push(tag);
                this.fixedTagsForAttr.set(tag.attr, tag);
            }
        }

        const sortedTags = tuple.tags.concat([]);
        sortedTags.sort((a, b) => a.compareCanonicalSort(b));
        this.sortedTags = sortedTags;

        Object.freeze(this.fixedTags);
        Object.freeze(this.fixedTagsForAttr);
        Object.freeze(this.sortedTags);
        Object.freeze(this);
    }
}
