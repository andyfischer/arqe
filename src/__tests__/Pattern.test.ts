
import { parsePattern } from '../parseCommand'
import PatternTag from '../PatternTag'

it('PatternTag.setValue works', () => {
    const tag = new PatternTag();
    tag.tagType = 'a';
    tag.tagValue = '1';
    expect(tag.stringify()).toEqual('a/1');

    const tag2 = tag.setValue('3');
    expect(tag2.stringify()).toEqual('a/3');
});

it('updateTagAtIndex works', () => {
    let p = parsePattern('a/1 b/2');
    expect(p.stringify()).toEqual('a/1 b/2');
    p = p.updateTagAtIndex(0, tag => tag.setValue('3'));
    expect(p.stringify()).toEqual('a/3 b/2');
});

it('updateTagOfType works', () => {
    let p = parsePattern('a/1 b/2');
    expect(p.stringify()).toEqual('a/1 b/2');
    p = p.updateTagOfType('b', tag => tag.setValue('3'));
    expect(p.stringify()).toEqual('a/1 b/3');
});
