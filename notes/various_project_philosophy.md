

Every command argument is potentially a lens.

Don't make the query-writer care about the order of operations for arguments. It's not their job.
When queries are parsed there's definitely an order of operations. A view like 'branch' probably goes first.

All data will be read & written through lens, often multiple layers.

The table(x) lens is perfectly acceptable. It's fine to do "setup work" (like defining schemas) before
saving data.

Clients should give up on the idea of a canonical data storage format- they only get to see through lenses,
sometimes multiple lenses look at the same data at once.
