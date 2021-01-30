
import Tag from '../Tag'
import parseTuple from '../stringFormat/parseTuple';

it('Tag.setValue works', () => {
    const tag = new Tag({ attr: 'a', value: '1' });
    expect(tag.stringify()).toEqual('a/1');

    const tag2 = tag.setValue('3');
    expect(tag2.stringify()).toEqual('a/3');
});

it('updateTagOfType works', () => {
    let p = parseTuple('a/1 b/2');
    expect(p.stringify()).toEqual('a/1 b/2');
    p = p.updateTagOfType('b', tag => tag.setValue('3'));
    expect(p.stringify()).toEqual('a/1 b/3');
});

it('isEmpty works', () => {
    let p = parseTuple('a b');
    expect(p.isEmpty()).toEqual(false);
    p = p.remapTags(tag => null)
    expect(p.isEmpty()).toEqual(true);
})
