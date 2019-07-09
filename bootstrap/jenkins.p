
def-command url-pattern
def-command template-param
def-command jenkins-job

url-pattern name=jenkins-build url=https://build.stage.shutterfly.com/job/JOB_NAME/build?delay=0sec

template-param pattern=jenkins-build replace=JOB_NAME name=job-name

jenkins-job name=bob-service-docker-publish

def-command build

command/build ..
  has-main-arg job
