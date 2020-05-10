import Graph from '../Graph';
import CommandLineToolApi from './CommandLineToolApi';
export default function runStandardProcess2(toolName: string, handler: (graph: Graph, api: CommandLineToolApi) => Promise<void>): Promise<void>;
