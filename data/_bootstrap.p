
def-command def-command
def-command def-relation
def-command def-function

def-relation is
def-relation includes
def-relation has
def-relation requires-arg
def-relation has-main-arg
def-relation has-second-main-arg
def-relation has-no-implementation
def-relation from-lazy-module
def-relation not-for-humans
def-relation takes-any-args

command/def-command ..
  requires-arg command-name
  has-main-arg command-name

command/def-relation ..
  requires-arg relation-name
  has-main-arg relation-name

def-command def-declaration
command/def-declaration ..
  has-no-implementation

def-command def-type
def-command def-function

command/def-declaration ..
  requires-arg declaration-name
  has-main-arg declaration-name

command/def-type ..
  requires-arg type-name
  has-main-arg type-name

command/def-function ..
  requires-arg function-name
  has-main-arg function-name

def-command eof
command/eof ..
  has-no-implementation
  not-for-humans

def-command def-collection
def-command def-language
def-command def-filetype
def-command def-alias
def-command def-relation
def-command name
def-command env
def-command load-file
def-command add-context
def-command remove-context
def-command dump
def-command file-contents
def-command deploy
def-command set
def-command help
def-command http-post
def-command define-toggle

command/define-toggle ..
  requires-arg name
  has-main-arg name

.. is type
  integer
  number
  string
  boolean
  null
  object

def-command set-in-current-file
command/set-in-current-file ..
  not-for-humans

command/set ..
  requires-arg name
  has-main-arg name
  requires-arg value
  has-second-main-arg value

def-function find-relations
command/find-relations ..
  takes-any-args

bootstrap-scripts includes ..
  agents.p
  cd.p
  cron.p
  debugging.p
  edit.p
  fix-js-project.p
  fs-bootstrap.p
  history.p
  jenkins.p
  languages.p
  load.p
  should-work.p
  timedate.p
  workingdir.p
  yarn.p

