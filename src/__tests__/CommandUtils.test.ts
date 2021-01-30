
import Pipe from '../Pipe'
import parseTuple from '../stringFormat/parseTuple';
import { emitSearchPatternMeta } from '../CommandUtils';

it('emitSearchPatternMeta includes identifiers', () => {

    const out = new Pipe('out');
    const t = parseTuple("a/$a b c/1");
    emitSearchPatternMeta(t, out);

    expect(out.take().map(t => t.stringify())).toEqual(['a/$a b c/1 command-meta search-pattern']);
})
