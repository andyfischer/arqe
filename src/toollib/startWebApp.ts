
import Graph from '../Graph'
import GraphLike from '../GraphLike'
import getProcessClient from '../toollib/getProcessClient'

export default async function startWebApp(appName: string): Promise<GraphLike>  {

    require('source-map-support').install();

    return await getProcessClient();
}
