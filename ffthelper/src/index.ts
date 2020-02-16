
import fetch from 'node-fetch'
import Graph from './fs/Graph'
import { saveObject } from './fs/GraphORM'
import Fs from 'fs-extra'

const graph = new Graph()

function toTagName(str) {
    return str.replace(/ /g, '')
        .replace(/\'/g, '');
}

const bootstrap = `
set skill/GilTaking skilltype/trap

set skill/GilTaking skilltype/trap
set skill/StealWeapon skilltype/trap

set skill/Revive category/rez
set skill/PhoenixDown category/rez
set skill/Raise category/rez
set skill/Raise2 category/rez

set skill/FastCharge rank/verygood
set skill/Doublehand rank/good
set skill/DamageSplit rank/good

set item/StoneGun rank/powerful

set class/Ninja rank/good
set class/Calculator rank/good
set class/Summoner rank/good
set class/Monk rank/good
set class/Lancer rank/good
set class/RedChocobo rank/good

set class/Taiju rank/verygood
set class/SteelGiant rank/verygood

set class/Dancer rank/bad
`

for (const command of bootstrap.split('\n'))
    graph.run(command)

async function main() {
    const data = await (fetch('https://fftbg.com/api/tournament/latest').then(d => d.json()));

    // Load all the JSON into the graph
    for (const teamName in data.Teams) {
        const teamData = data.Teams[teamName];

        const teamId = await saveObject(graph, 'team/#unique', { name: teamName });

        for (const unit of teamData.Units) {

            const className = toTagName(unit.Class);
            const unitId = (await saveObject(graph, 'unit/#unique', unit)).stringify()

            graph.runSync(`set ${unitId} ${className}`)

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