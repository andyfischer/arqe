
# Goal #

Launch a generic Javascript / Node.js process. The process would connect with the
tags DB, and then execute code from there. The process is extremely flexible and
generic, and is more of a "shell"

# Details #

On startup the process will:

 1) Connect to the database.
   - HTTP / Socket connection?
   - Connect to default address, or get a custom address from env var.

 2) Receive commands/tasks through the database connection.
   - All the relevant commands would be tagged with an execution id.

 3) Compile and eval the Javascript.
  - For first draft, we can just share a raw JS string that goes straight to eval().

 4) Communicate back the execution results.
  - Save back tag with 'result' ?

---

# Related notes #

Process will set up a *data sharing* connection with the database.

 - Shell says "Subscribe to all the relations associated with a given tag"
 - All existing relations are downloaded.
 - Any new relations are shared.
 - In some cases, the shell might need to fetch other data.

# Implementation steps #

 - Launch tags-db as standalone process.
 - Write API for socket communication.
 - Write shell app.
 - Hook up with repl.

# Use cases #
