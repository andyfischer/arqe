
import Pattern from '../Pattern'

class LazyMap<K,V> {
    m = new Map<K,V>()
    loader: (key: K) => V

    constructor(loader) {
        this.loader = loader;
    }

    get(key: K): V {
        if (!this.m.has(key)) {
            const val = this.loader(key);
            this.m.set(key, val);
            return val;
        }

        return this.m.get(key);
    }

    values() {
        return this.m.values();
    }
}

class Column {
    title: string
    items: string[] = []
    width = 0

    outputStrings: string[] = []

    constructor(title: string) {
        this.title = title;
    }

    format(s: string) {
        s = s || '';
        return rightPadSpaces(s, this.width);
    }
}

function rightPadSpaces(s: string, size: number) {
    if (s.length > size)
        throw new Error(`internal error, string '${s}' is bigger than size ${size}`);


    let spaceRight = size - s.length;
    return s + ' '.repeat(spaceRight);
}

function centerPadSpaces(s: string, size: number) {
    if (s.length > size)
        throw new Error(`internal error, string '${s}' is bigger than size ${size}`);

    let spaceLeft = Math.floor((size - s.length) / 2);
    let spaceRight = Math.ceil((size - s.length) / 2);

    return ' '.repeat(spaceLeft) + s + ' '.repeat(spaceRight);
}

// see https://en.wikipedia.org/wiki/Box-drawing_character
//const horizLineChar = '\u2500'
//const vertLineChar = '\u2502'
//const crossLineChar = '\u253c'

const horizLineChar = '\u2501'
const vertLineChar = '\u2503'
const crossLineChar = '\u254b'

export default function printAsTable(patterns: Pattern[]): string[] {

    const columns = new LazyMap<string,Column>(title => new Column(title));
    const outputLines = [];

    // Figure out all the columns.
    for (const pattern of patterns) {
        for (const tag of pattern.tags) {
            if (tag.attr) {
                const column: Column = columns.get(tag.attr);
                column.items.push(tag.tagValue);
            }
        }
    }

    // Find max width for each column
    for (const column of columns.values()) {

        column.width = Math.max(column.width, column.title.length);

        for (const item of column.items) {
            let length = (item && item.length) || 0;
            if (!isFinite(length))
                length = 0;
            column.width = Math.max(column.width, length);
        }
    }

    // Format output of title bar
    const titleEls = [];
    const titleBarEls = [];
    for (const column of columns.values()) {
        titleEls.push(column.format(column.title));
        titleBarEls.push(horizLineChar.repeat(column.width));
    }

    outputLines.push(titleEls.join(` ${vertLineChar} `));
    outputLines.push(titleBarEls.join(`${horizLineChar}${crossLineChar}${horizLineChar}`));

    // Format every row
    for (const pattern of patterns) {
        const outputEls = [];
        for (const column of columns.values()) {
            if (pattern.hasAttr(column.title)) {
                outputEls.push(column.format(pattern.getValueForType(column.title)));
            }
        }
        outputLines.push(outputEls.join(` ${vertLineChar} `));
    }

    return outputLines;
}
