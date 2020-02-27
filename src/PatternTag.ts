
export interface FixedTag {
    tagType: string
    tagValue: string
}

export default class PatternTag {
    tagType?: string
    tagValue?: string
    negate?: boolean
    star?: boolean
    doubleStar?: boolean
    starValue?: boolean
    questionValue?: boolean
    identifier?: string
}
