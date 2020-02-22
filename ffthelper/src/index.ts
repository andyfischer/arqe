
import fetch from 'node-fetch'
import Graph from './fs/Graph'
import { saveObject } from './fs/GraphORM'
import Fs from 'fs-extra'
import { mountDerivedTag } from './fs/DerivedValueMount'
import UpdateContext from './fs/UpdateContext'

const graph = new Graph()

function toTagName(str) {
    return str.replace(/ /g, '')
        .replace(/\'/g, '');
}

const bootstrap = `
set skill/GilTaking skilltype/trap

set skill/GilTaking skilltype/trap
set skill/StealWeapon skilltype/trap
set skill/Wiznabius skilltype/trap
set skill/NamelessSong skilltype/trap

set skill/Revive category/rez
set skill/PhoenixDown category/rez
set skill/Raise category/rez
set skill/Raise2 category/rez

set skill/FastCharge rank/verygood
set skill/GalaxyStop rank/verygood
set skill/Doublehand rank/good
set skill/DamageSplit rank/good

set item/StoneGun rank/powerful
set item/Ribbon rank/powerful

set class/Ninja rank/good
set class/Calculator rank/good
set class/Summoner rank/good
set class/Monk rank/good
set class/Lancer rank/good
set class/RedChocobo rank/good

set class/Taiju rank/verygood
set class/SteelGiant rank/verygood

set class/TimeMage rank/bad
set class/Dancer rank/bad
`;


function run(graph: Graph, cmd: string) {

    const result = graph.runSync(cmd);
    console.log(' ran: ' + cmd);
    console.log(' > ' + result);
    return result;
}

mountDerivedTag(graph, 'unit/* unit-has-rez', 'unit-has-rez', (cxt: UpdateContext, rel) => {

    const result = graph.runSync(`get -exists ${rel.getTag('unit')} has-skill/$a | join skill/$a category/rez`)
    return result === '#exists';
})

for (const command of bootstrap.split('\n'))
    graph.run(command)

async function main() {
    const data = await (fetch('https://fftbg.com/api/tournament/latest').then(d => d.json()));

    // Load all the JSON into the graph
    for (const teamName in data.Teams) {
        const teamData = data.Teams[teamName];

        const team = await saveObject(graph, 'team/#unique', { name: teamName });
        const teamId = team.getTag('team');

        for (const unit of teamData.Units) {

            const className = toTagName(unit.Class);
            const unitId = (await saveObject(graph, 'unit/#unique', unit)).stringify()

            graph.runSync(`set ${unitId} ${className}`)
            graph.runSync(`set ${teamId} ${unitId}`)

            for (const skill of unit.ClassSkills) {
                await graph.runSync(`set ${unitId} has-skill/${toTagName(skill)}`)
            }

            for (const extraSkill of unit.ExtraSkills) {
                await graph.runSync(`set ${unitId} has-skill/${toTagName(extraSkill)}`)
            }
        }
    }

    for (const winner of data.Winners) {
        console.log('saw winner: ', winner);
    }

    await Fs.writeFile('dump.graph', (await graph.runAsync('dump') as string[]).join('\n'))

    // Analyze
    graph.runDerived(cxt => {
        for (const team of cxt.get('team/*')) {

            const teamId = team.getTag('team');

            console.log('analyzing team: ', cxt.getOne(`${teamId} .name`).getValue())

            run(graph, `get ${teamId} unit/$a | join unit/$a has-skill/Revive`)

            run(graph, `get ${teamId} unit/$a | join unit/$a unit-has-rez`)

            // console.log(graph.runSync(`get -count ${teamId} unit/$a | join unit/$a has-skill/Revive`))
        }
    });

    graph.runDerived(cxt => {
        for (const unit of cxt.get('unit/*')) {
            run(graph, `get ${unit.getTag('unit')} unit-has-rez`);
        }
    });
}

main()
.catch(console.error);
