
# arqe - Abstract Relational Query Engine #

General purpose engine for making anything available via a relational query interface. Implemented in Typescript.

Current project status: Experimental phase, not ready to use yet.

Provides:

 - A query engine that handles parsing, planning, and execution.
 - A pretty easy API for mounting your own arbitrary data or functions into the system.
 - Standard tables for things like accessing the filesystem, network, caching, etc.

Overall goals:

 - Investigate the question: What if everything in a software project was modeled and implemented as relational-style tables?
 - Live programming. No build & restart cycle. The system is just always available.
 - High visibility. Each part of the system can be examined.
 - High collaboration.
 - Provide a really useful CLI shell.
 - Store code as structured relational data, enabling "nosyntax" style IDEs.
 - Unified storage for all the other "non-code" metadata that happens in typical software projects: configs, feature flags, branching, versioning, a/b traffic splitting, and more.
 - Unified software tooling. Have one system that does lots of things, instead of many different unitasker tools.

Inspirations and influences:

 - Relational tables over foreign data: [OSQuery](https://osquery.io/), [SQL foreign data wrappers](https://wiki.postgresql.org/wiki/Foreign_data_wrappers), and others.
 - Codd's relational model of data
 - [The Third Manifesto](https://www.dcs.warwick.ac.uk/~hugh/TTM/DTATRM.pdf)
 - ["Compilers are databases"](https://www.youtube.com/watch?v=WxyyJyB_Ssc) - Martin Odersky

