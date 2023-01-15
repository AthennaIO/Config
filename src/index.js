/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import lodash from 'lodash'
import check from 'syntax-error'
import { parse } from 'node:path'
import { File, Folder, Is, Json, Module, Path } from '@athenna/common'

import { Env } from '#src/Env/Env'
import { ConfigSyntaxException } from '#src/Exceptions/ConfigSyntaxException'
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
   * Verify if configuration key has the same value.
   *
   * @param {string} key
   * @param {any|any[]} values
   * @return {boolean}
   */
  static is(key, ...values) {
    let is = false
    values = Is.Array(values[0]) ? values[0] : values

    for (const value of values) {
      if (this.get(key) === value) {
        is = true
        break
      }
    }

    return is
  }

  /**
   * Verify if configuration key does not have the same value.
   *
   * @param {string} key
   * @param {any|any[]} values
   * @return {boolean}
   */
  static isNot(key, ...values) {
    return !this.is(key, ...values)
  }

  /**
   * Verify if configuration key exists.
   *
   * @param {string} key
   * @return {boolean}
   */
  static exists(key) {
    return !!this.get(key)
  }

  /**
   * Verify if configuration key does not exist.
   *
   * @param {string} key
   * @return {boolean}
   */
  static notExists(key) {
    return !this.exists(key)
  }

  /**
   * Verify if configuration keys exists.
   *
   * @param {string[]} keys
   * @return {boolean}
   */
  static existsAll(...keys) {
    let existsAll = true
    keys = Is.Array(keys[0]) ? keys[0] : keys

    for (const key of keys) {
      if (this.notExists(key)) {
        existsAll = false

        break
      }
    }

    return existsAll
  }

  /**
   * Verify if configuration keys not exists.
   *
   * @param {string[]} keys
   * @return {boolean}
   */
  static notExistsAll(...keys) {
    return !this.existsAll(...keys)
  }

  /**
   * Set a value in the configuration key.
   *
   * @param {string} key
   * @param {any|any[]} value
   * @return {typeof Config}
   */
  static set(key, value) {
    value = Json.copy(value)

    const [mainKey, ...keys] = key.split('.')

    if (key === mainKey) {
      this.configs.set(key, value)

      return this
    }

    const config = this.configs.get(mainKey) || {}
    this.configs.set(mainKey, lodash.set(config, keys.join('.'), value))

    return this
  }

  /**
   * Delete the configuration key.
   *
   * @param {string} key
   * @return {typeof Config}
   */
  static delete(key) {
    if (this.notExists(key)) {
      return this
    }

    const [mainKey, ...keys] = key.split('.')

    if (key === mainKey) {
      this.configs.delete(key)

      return this
    }

    const config = this.configs.get(mainKey)
    lodash.unset(config, keys.join('.'))
    this.configs.set(mainKey, config)

    return this
  }

  /**
   * Get the value from config file by key. If not
   * found, defaultValue will be used.
   *
   * @param {string} [key]
   * @param {any,undefined} [defaultValue]
   * @return {any}
   */
  static get(key, defaultValue = undefined) {
    if (!key) {
      const config = {}

      for (const [key, value] of this.configs.entries()) {
        config[key] = value
      }

      return config
    }

    const [mainKey, ...keys] = key.split('.')

    const config = this.configs.get(mainKey)

    return Json.copy(Json.get(config, keys.join('.'), defaultValue))
  }

  /**
   * Load all configuration files in path.
   *
   * @param {string} path
   * @param {boolean} safe
   * @return {Promise<void>}
   */
  static async loadAll(path = Path.config(), safe = false) {
    const { files } = await new Folder(path).load()

    const promises = files.map(file =>
      safe ? this.safeLoad(file.path) : this.load(file.path),
    )

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
    const syntaxErr = check(fileContent, file.href, {
      sourceType: 'module',
    })

    if (syntaxErr) {
      throw new ConfigSyntaxException(syntaxErr, file.base)
    }

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
        match = match.replace('Config.get', '').replace(/[(^)'"]/g, '')

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
