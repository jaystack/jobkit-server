import * as fs from 'fs-extra'
import * as path from 'path'
import config = require('config')

export default {
  get: async (collectionName: string, id?: string) => {
    await ensureStoreDir()
    const collection: any[] = await fs.readJSON(getPath(collectionName))
    return id ? collection.find(doc => doc.id === id) : collection
  }
}

function getStorePath(): string {
  const relativePath = config.get('storagePath')
  return path.normalize(`${__dirname}/${relativePath}`)
}

function getPath(collectionName: string): string {
  return path.normalize(`${getStorePath()}/${collectionName}.json`)
}

function ensureStoreDir() {
  return fs.ensureDir(getStorePath())
}
