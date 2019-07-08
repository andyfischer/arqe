
export default interface ParsedTag {
    normalizedString: string
    tags: string[]
    tagTable: { [tag: string]: true }
    tagCount: number
}
