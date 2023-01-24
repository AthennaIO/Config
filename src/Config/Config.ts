/**
 * @athenna/config
 *
 * (c) Victor Tesoura Júnior <txsoura@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import check from 'syntax-error'

import {
  File,
  Json,
  Path,
  Folder,
  Module,
  ObjectBuilder,
} from '@athenna/common'

import { parse } from 'node:path'
import { ConfigSyntaxException } from '#src/Exceptions/ConfigSyntaxException'
import { RecursiveConfigException } from '#src/Exceptions/RecursiveConfigException'

export class Config {
  /**
   * Object to save all the configurations.
   */
  public static configs: ObjectBuilder = Json.builder({
    ignoreNull: false,
    ignoreUndefined: true,
    referencedValues: false,
  })

  /**
   * Clear all the configurations of configs object.
   */
  public static clear(): typeof Config {
    this.configs = Json.builder({
      ignoreNull: false,
      ignoreUndefined: true,
      referencedValues: false,
    })

    return this
  }

  /**
   * Verify if configuration key has the same value.
   */
  public static is(key: string, ...values: any[]): boolean {
    return this.configs.is(key, ...values)
  }

  /**
   * Verify if configuration key does not have the same value.
   */
  public static isNot(key: string, ...values: any[]): boolean {
    return this.configs.isNot(key, ...values)
  }

  /**
   * Verify if configuration key exists.
   */
  public static exists(key: string): boolean {
    return this.configs.exists(key)
  }

  /**
   * Verify if configuration key does not exist.
   */
  public static notExists(key: string): boolean {
    return this.configs.notExists(key)
  }

  /**
   * Verify if configuration keys exists.
   */
  public static existsAll(...keys: any[]): boolean {
    return this.configs.existsAll(...keys)
  }

  /**
   * Verify if configuration keys not exists.
   */
  public static notExistsAll(...keys: any[]): boolean {
    return this.configs.notExistsAll(...keys)
  }

  /**
   * Set a value in the configuration key.
   */
  public static set(key: string, value: any | any[]): typeof Config {
    this.configs.set(key, value)

    return this
  }

  /**
   * Delete the configuration key.
   */
  public static delete(key: string): typeof Config {
    this.configs.delete(key)

    return this
  }

  /**
   * Get the value from Config file by key. If not
   * found, defaultValue will be used.
   */
  public static get<T = any>(key?: string, defaultValue: any = undefined): T {
    return this.configs.get<T>(key, defaultValue)
  }

  /**
   * Load all configuration files in path.
   */
  public static async loadAll(
    path = Path.config(),
    safe = false,
  ): Promise<void> {
    if (!(await Folder.exists(path))) {
      return
    }

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
    if (!(await File.exists(path))) {
      return
    }

    const { name } = parse(path)

    if (this.exists(name)) {
      return
    }

    return this.load(path, callNumber)
  }

  /**
   * Load the configuration file.
   */
  public static async load(path: string, callNumber = 0): Promise<void> {
    if (!(await File.exists(path))) {
      return
    }

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