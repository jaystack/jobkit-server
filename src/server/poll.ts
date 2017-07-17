import config = require('config')
import git = require('simple-git/promise')
import * as path from 'path'
import store from './store'
import { Job } from './types'

function getJobs(): Promise<Job[]> {
  return store.get('jobs')
}

function getRepositoryPath(repositoryUrl: string): string {
  const name = resolveRepositoryName(repositoryUrl)
  const reposRelativePath = config.get('reposPath')
  return path.normalize(`${__dirname}/${reposRelativePath}/${name}`)
}

function resolveRepositoryName(repositoryUrl: string): string {
  const result = /\/([^\/]+).git$/.exec(repositoryUrl)
  if (!result[1])
    throw new Error(`Cannot resolve repository name from ${repositoryUrl}`)
  return result[1]
}

function getRepositories(jobs: Job[]): string[] {
  return jobs.reduce((nameSet, job) => {
    return nameSet.includes(job.trigger.repository)
      ? nameSet
      : [ ...nameSet, job.trigger.repository ]
  }, [])
}

async function fetchRepository(repository: string) {
  try {
    const repositoryPath = getRepositoryPath(repository)
    console.log(repositoryPath)
    console.log(await git(repositoryPath).fetch('origin', 'thunk'))
  } catch (error) {
    console.error(error)
  }
}

async function fetchRepositories(repositories: string[]) {
  for (const repository of repositories) {
    await fetchRepository(repository)
  }
}

async function poll() {
  const jobs = await getJobs()
  const repositories = getRepositories(jobs)
  await fetchRepositories(repositories)
}

export default function() {
  const interval = config.get('pollInterval')
  poll()
  setInterval(poll, interval)
}
