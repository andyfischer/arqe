
import CommandConnection from './CommandConnection'
import parseCommand from './parseCommand'

export default async function acquireConnectionId(conn: CommandConnection) {

    const result = await conn.run('save connection/#unique');
    const parsed = parseCommand(result);

    if (parsed.command !== 'save')
        throw new Error('acquireProcessTag expected save response: ' + result);

    if (parsed.tags[0].tagType !== 'connection')
        throw new Error('acquireProcessTag expected process/ tag: ' + result);

    return parsed.tags[0].tagValue;

}
