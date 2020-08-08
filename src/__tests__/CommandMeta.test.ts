
import Pipe from '../Pipe'
import parseTuple from '../parseTuple';
import { emitSearchPatternMeta } from '../CommandMeta';

it('emitSearchPatternMeta includes identifiers', () => {

    const out = new Pipe();
    const t = parseTuple("a/$a b c/1");
    emitSearchPatternMeta(t, out);

    expect(out.take().map(t => t.stringify())).toEqual(['a/$a b c/1 command-meta search-pattern']);
})