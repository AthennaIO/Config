/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { parse } from 'node:path'
import { File, Folder, Json, Module, Path } from '@athenna/common'

import { Env } from '#src/Env/Env'
import { RecursiveConfigException } from '#src/Exceptions/RecursiveConfigException'
import { ConfigNotNormalizedException } from '#src/Exceptions/ConfigNotNormalizedException'

export * from './Env/Env.js'
export * from './Helpers/EnvHelper.js'

export class Config {
  /**
   * Map structure to save all configuration files.
   *
   * @type {Map<string, any>}
   */
  static configs = new Map()

  /**
   * Get the value from config file by key. If not
   * found, defaultValue will be used.
   *
   * @param {string} key
   * @param {any,undefined} defaultValue
   * @return {any}
   */
  static get(key, defaultValue = undefined) {
    const [mainKey, ...keys] = key.split('.')

    const config = this.configs.get(mainKey)

    return Json.get(config, keys.join('.'), defaultValue)
  }

  /**
   * Load all configuration files in path.
   *
   * @param {string} path
   * @return {Promise<void>}
   */
  static async loadAll(path = Path.config()) {
    const { files } = await new Folder(path).load()

    const promises = files.map(file => this.safeLoad(file.path))

    await Promise.all(promises)
  }

  /**
   * Load the configuration file only if it has
   * not been loaded yet.
   *
   * @param {string} path
   * @param {number?} callNumber
   * @return {Promise<void>}
   */
  static async safeLoad(path, callNumber) {
    const { name } = parse(path)

    if (this.configs.has(name)) {
      return
    }

    return this.load(path, callNumber)
  }

  /**
   * Load the configuration file.
   *
   * @param {string} path
   * @param {number?} callNumber
   * @return {Promise<void>}
   */
  static async load(path, callNumber = 0) {
    const { dir, name, base, ext } = parse(path)

    if (callNumber > 500) {
      throw new RecursiveConfigException(path, name)
    }

    if (base.includes('.js.map') || base.includes('.d.ts')) {
      return
    }

    const file = new File(path).loadSync()
    const fileContent = file.getContentSync().toString()

    if (
      !fileContent.includes('export default') &&
      !fileContent.includes('module.exports') &&
      !fileContent.includes('exports.default')
    ) {
      throw new ConfigNotNormalizedException(path)
    }

    if (fileContent.includes('Config.get')) {
      const matches = fileContent.match(/Config.get\(([^)]+)\)/g)

      for (let match of matches) {
        match = match.replace('Config.get', '').replace(/[(^)']/g, '')

        const fileName = `${match.split('.')[0]}`
        const fileBase = `${fileName}${ext}`
        const filePath = `${dir}/${fileBase}`

        await this.safeLoad(filePath, callNumber + 1)
      }
    }

    /**
     * Add random number to file import path so
     * Node.js will not cache the imported file.
     */
    const versionedPath = `${file.href}?version=${Math.random()}`

    this.configs.set(name, await Module.get(import(versionedPath)))
  }
}

if (!global.Env) {
  global.Env = Env
}

if (!global.Config) {
  global.Config = Config
}
