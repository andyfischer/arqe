
import ParsedTag from './ParsedTag'

export default function parseTag(tag: string) {
    const items = tag.split(' ');

    const table = {}
    for (const item of items) {
        table[item] = true;
    }

    return {
        normalizedString: tag,
        tags: items,
        tagTable: table,
        tagCount: items.length
    }
}
