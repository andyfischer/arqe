
# Description #

tags-db is an application database that contains associations of tag sets with values.
Each entry in the database is associated with N string keys ("tags"), and an arbitraty
value.

# GOALS #

The structure has the following goals:

 - Support *incremental* and *additive* knowledge. Given an existing application, it should
   be easy to add additional facts and entries into various areas of the project.
 - Support *dimensional* knowledge. (see below)
 - Provide a uniform interface for data usage

# Non Goals #

 - Tags-db is not optimized to rabidly handle any ad hoc queries. Incoming queries will
   fall into two categories:
     - Prepared queries, optimized for specific access patterns. Fast.
     - Ad hoc queries. Maybe slow. Used during debugging / troubleshooting / exploring.

# Human centric #

The interface is deliberately human-centric. Queries are string based so that they can be
entered in a REPL. And when an application stores all its knowledge in tags-db, it becomes
highly introspectable.

# Fluid lifecycle #

Tags-db has value as a single interface no matter where the code happens in the lifecycle.
Typical systems have a sharp divide between build-time and run-time code, or server-side
versus client-side code. Tags-db can handle data related to any lifecycle time, so it
allows for code to fluidly cross boundaries (when appropriate)

# Concept: Dimensional Knowledge #

All pieces of knowledge or data in the system are associated with one or more *dimensions*.
Dimensions can be related to the software delivery process: such as branches, releases, 
and experiments. Or they can be related to the execution environment: such as the process
or node.

The database supports arbitrary dimensions. There are a few that are standard and canonical,
but more can always be added.

    USE CASE: It's possible to make a specific value different in a branch, by storing an
    entry with a branch tag.

# DETAILS #

Each stored entry has:

 - A set of one or more "tags".
 - Optionally, an arbitrary value associated.

Each tag has:

 - A "type"
 - Optionally, an id string.

Tags are presented as <type>=<id> strings, such as "branch=master"

# Example queries #

 - Get the value associated with specific tags: `a=x b=y`
 - Get all connections between a specific tag and another type: `a=x b=*`
 - Get all entries with certain types: `a=* b=*`
 - Get all associated data related to certain tags: `a=x *`

# Example tag types #

 - Execution environment
   - Process
     - Only required for inter-process shared data. In a cloud environment, might
       use 'node' or 'task' instead.
   - Node or Task
     - Maybe used in a cloud environment.
   - Zone
     - Cloud availability zone.
 - Release delivery
   - Project or Package
     - The atomic unit of delivery: one release event delivers one package version.
   - Branch
     - Optional. Used for feature branches.
   - Release
     - Maybe creates an immutable query.
   - Experiment
     - Similar to Branch. Used for experimentation or A/B testing.
 - Change tracking
   - Sha1
     - Creates an immutable query
     - Discoverable when missing
   - Timestamp
     - Creates an immutable query
     - Discoverable when missing
   - Revision
     - Allow special name 'revision/latest'? (not immutable)
     - Creates an immutable query
     - Discoverable when missing
 - Code organization
   - Module
   - Class
   - Function
     - Could be a special form on a block?
   - Block
     - Most are anonymous, require unique IDs. Maybe unique relative to a module or class?
   - Term
     - Most are anonymous, require unique IDs. Maybe unique relative to a block?
 - Filesystem
   - Directory
     - Might be relative to a project root.
   - Filename
   - Filechunk
   - Line

# Relations #

Often a tag might have a one-to-many relation with another tag.

# Contextual tags #

Whenever tags-db is being accessed, there are almost always *contextual tags*. These are implied
and mostly invisible. One example is a tag for the process ID. If the database is just doing
in-memory storage then there's no reason for the process ID to even be mentioned, instead can assume
that every piece of data has the current process ID attached. Then if the process starts sharing
data remotely, the process ID might become relevant and it might become explicit.

# Usage-specific optimizations #

tags-db is used ubiquoutously for application knowledge. Since an app might potentially perform
thousands or millions of accesses for stored data, the database has support for *domain-specifc
optimizations*. Instead of having every data access require a separate string query, an application
might set up a *saved query* that is optimized for a certain usage pattern.

# Backing stores #

tags-db is flexible about the storage format. SQL and Nosql stores are planned.

# Project Integration #

tags-db integrates strongly with *bootstrap-runtime*. It's common for bootstrap commands to save
data into tags-db, where the application can use it (using the tags-db application UI). The
tags-db syntax can be directly used in bootstrap commands.


