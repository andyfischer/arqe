
import fetch from 'node-fetch'
import Graph from './fs/Graph'
import { saveObject } from './fs/GraphORM'
import Fs from 'fs-extra'

const graph = new Graph()

function toTagName(str) {
    return str.replace(/ /g, '')
        .replace(/\'/g, '');
}

graph.run('set skill/GilTaking skilltype/trap')
graph.run('set skill/StealWeapon skilltype/trap')

graph.run('set skill/Revive category/rez')
graph.run('set skill/PhoenixDown category/rez')
graph.run('set skill/Raise category/rez')
graph.run('set skill/Raise2 category/rez')

graph.run('set item/StoneGun rank/powerful')

async function main() {
    const data = await (fetch('https://fftbg.com/api/tournament/latest').then(d => d.json()));

    // Load all the JSON into the graph
    for (const teamName in data.Teams) {
        const teamData = data.Teams[teamName];

        const teamId = await saveObject(graph, 'team/#unique', { name: teamName });

        for (const unit of teamData.Units) {
            const unitId = (await saveObject(graph, 'unit/#unique', unit)).stringify()

            for (const skill of unit.ClassSkills) {
                await graph.runSync(`set ${unitId} has-skill/${toTagName(skill)}`)
            }

            for (const extraSkill of unit.ExtraSkills) {
                await graph.runSync(`set ${unitId} has-skill/${toTagName(extraSkill)}`)
            }
        }
    }

    await Fs.writeFile('dump.graph', (await graph.runAsync('dump') as string[]).join('\n'))
}

main()
.catch(console.error);
