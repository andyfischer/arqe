
/*
  Thoughts on pipes-
    Hard to have an efficient reader with the current flow.
    
     - Need to know when the 'meta' tags are done
     - Would help to have partitions and know when a partition is done.
     - Should probably just separate 'meta' from main relations?
     - Maybe always have a single 'meta' tuple?

 Goals:
  - Allow simple usage to be simple
  - Allow complicated usage to be possible without too much craziness

 Moving forward:
  - Maybe we keep the current style but add a rule, all 'meta' must come before non-meta.
    - This wouldn't be too hard to check.

  - How to handle partitions?
    - Seems like a tough problem, probably not ready to solve yet!

*/

import RelationPipe from './RelationPipe'

export function combinePipes(pipe1: RelationPipe, pipe2: RelationPipe) {
    const out = new RelationPipe();
    pipe1.pipeToReceiver(out);
    pipe2.pipeToReceiver(out);
    return out;
}

export function deduplicate(pipe: RelationPipe) {
    // Very simple approach
}
