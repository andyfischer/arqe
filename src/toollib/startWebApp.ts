
import Graph from '../Graph'
import GraphLike from '../GraphLike'
import getProcessClient from '../toollib/getProcessClient'

export default async function startWebApp(appName: string): Promise<GraphLike>  {
    return await getProcessClient();
}
