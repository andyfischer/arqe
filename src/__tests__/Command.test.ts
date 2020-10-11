
import Command, { commandToJson, jsonToCommand } from '../Command'
import parseTuple from '../stringFormat/parseTuple';

it('parses to and from json object', () => {
    const command = new Command('get', parseTuple('a b'), { flag: true });
    const asObject = commandToJson(command);
    const backToCommand = jsonToCommand(asObject);

    expect(command.verb).toEqual(backToCommand.verb);
    expect(command.tuple.stringify()).toEqual(backToCommand.tuple.stringify());
});
