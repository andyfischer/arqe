import { ChaosMode } from './ChaosModes';
import Runnable from '../../Runnable';
interface RunOptions {
    allowError?: true;
    graph: Runnable;
    chaosMode?: ChaosMode;
}
export default function run(command: any, opts?: RunOptions): Promise<string | string[]>;
export {};
