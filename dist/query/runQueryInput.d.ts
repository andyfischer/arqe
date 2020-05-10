import { Snapshot } from '../framework';
import QueryOptions from './QueryOptions';
import QueryResult from './QueryResult';
export default function runInput(snapshot: Snapshot, input: string, opts?: QueryOptions): Promise<QueryResult>;
