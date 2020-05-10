import { Query, QueryResult } from '.';
import { Snapshot } from '../framework';
export default function runOneQuery(snapshot: Snapshot, query: Query): Promise<QueryResult>;
