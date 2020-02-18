
export default function stringifyRelation(tags: PatternTag[], schema: Schema) {

    if (schema) {
        tags.sort((a: PatternTag, b: PatternTag) => {
            return schema.ordering.compareTagTypes(a.tagType, b.tagType);
        });
    }

    const args = keys.map(key => {
        const value = this.getTagValue(key);
        if (key === 'option')
            return '.' + value;

        let str = key;

        if (value !== true)
            str += `/${value}`

        return str;
    });
}
