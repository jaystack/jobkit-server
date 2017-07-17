export interface Job {
  name: string
  trigger: {
    repository: string
    branch: string
  }
}
