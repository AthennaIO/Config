/**
 * @athenna/Config
 *
 * (c) Victor Tesoura Júnior <txsoura@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import lodash from 'lodash'
import check from 'syntax-error'
import { parse } from 'node:path'

import { File, Folder, Is, Json, Module, Path } from '@athenna/common'

import { ConfigSyntaxException } from '#src/Exceptions/ConfigSyntaxException'
import { RecursiveConfigException } from '#src/Exceptions/RecursiveConfigException'

export class Config {
  /**
   * Map structure to save all configuration files.
   */
  public static configs = new Map<string, any>()

  /**
   * Verify if configuration key has the same value.
   */
  public static is(key: string, ...values: any[]): boolean {
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
   */
  public static isNot(key: string, ...values: any[]): boolean {
    return !this.is(key, ...values)
  }

  /**
   * Verify if configuration key exists.
   */
  public static exists(key: string): boolean {
    return !!this.get(key)
  }

  /**
   * Verify if configuration key does not exist.
   */
  public static notExists(key: string): boolean {
    return !this.exists(key)
  }

  /**
   * Verify if configuration keys exists.
   */
  public static existsAll(...keys: any[]): boolean {
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
   */
  public static notExistsAll(...keys: any[]): boolean {
    return !this.existsAll(...keys)
  }

  /**
   * Set a value in the configuration key.
   */
  public static set(key: string, value: any | any[]): typeof Config {
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
   */
  public static delete(key: string): typeof Config {
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
   * Get the value from Config file by key. If not
   * found, defaultValue will be used.
   */
  public static get<T = any>(key?: string, defaultValue: any = undefined): T {
    if (!key) {
      const config: any = {}

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
   */
  public static async loadAll(
    path: string = Path.config(),
    safe = false,
  ): Promise<void> {
    const { files } = await new Folder(path).load()

    const promises = files.map(file =>
      safe ? this.safeLoad(file.path) : this.load(file.path),
    )

    await Promise.all(promises)
  }

  /**
   * Load the configuration file only if it has
   * not been loaded yet.
   */
  public static async safeLoad(
    path: string,
    callNumber?: number,
  ): Promise<void> {
    const { name } = parse(path)

    if (this.configs.has(name)) {
      return
    }

    return this.load(path, callNumber)
  }

  /**
   * Load the configuration file.
   */
  public static async load(path: string, callNumber = 0): Promise<void> {
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
