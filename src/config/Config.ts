/**
 * @athenna/config
 *
 * (c) Victor Tesoura Júnior <txsoura@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {
  File,
  Json,
  Path,
  ObjectBuilder,
  Exec,
  Module,
  Is
} from '@athenna/common'
import { debug } from '#src/debug'
import { loadFile, writeFile } from 'magicast'
import { sep, parse, extname } from 'node:path'
import { RecursiveConfigException } from '#src/exceptions/RecursiveConfigException'
import { NotSupportedKeyException } from '#src/exceptions/NotSupportedKeyException'
import { NotValidArrayConfigException } from '#src/exceptions/NotValidArrayConfigException'

export class Config {
  /**
   * Object to save all the configurations.
   */
  public static configs: ObjectBuilder = Json.builder({
    ignoreNull: false,
    ignoreUndefined: true,
    referencedValues: false
  })

  /**
   * Object to save all the paths of the configuration files.
   */
  public static paths: ObjectBuilder = Json.builder({
    ignoreNull: false,
    ignoreUndefined: true,
    referencedValues: false
  })

  public static fatherConfigPath: string = null

  /**
   * Clear all the configurations of config object.
   */
  public static clear(): typeof Config {
    this.configs = Json.builder({
      ignoreNull: false,
      ignoreUndefined: true,
      referencedValues: false
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
   * Verify if a configuration key exists.
   */
  public static exists(key: string): boolean {
    return this.configs.exists(key)
  }

  /**
   * Verify if a configuration key does not exist.
   */
  public static notExists(key: string): boolean {
    return this.configs.notExists(key)
  }

  /**
   * Verify if configuration keys exist.
   */
  public static existsAll(...keys: any[]): boolean {
    return this.configs.existsAll(...keys)
  }

  /**
   * Verify if configuration keys not exist.
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
   * Set a value in the configuration key if the value is not defined.
   */
  public static safeSet(key: string, value: any | any[]): typeof Config {
    if (this.configs.exists(key)) {
      return this
    }

    this.configs.set(key, value)

    return this
  }

  /**
   * Push a value to a configuration key that is a valid array.
   * If the configuration is not an array, an exception will be thrown.
   */
  public static push(key: string, value: any | any[]): typeof Config {
    const config = this.configs.get(key, [])

    if (!Is.Array(config)) {
      throw new NotValidArrayConfigException(key)
    }

    if (Is.Array(value)) {
      config.push(...value)
    } else {
      config.push(value)
    }

    this.configs.set(key, config)

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
   * Rewrite the configuration file. All values
   * set in the configuration using the Config
   * class will be saved in the file.
   *
   * @example
   * ```ts
   * Config.set('app.foo', 'bar')
   *
   * await Config.rewrite('app')
   * ```
   */
  public static async rewrite(key: string): Promise<void> {
    if (!this.paths.exists(key)) {
      throw new NotSupportedKeyException(key)
    }

    const path = this.paths.get(key)

    const mod = await loadFile(path)
    const config = this.configs.get(key)

    mod.exports.default = config

    await writeFile(mod.$ast, path, {
      quote: 'single',
      tabWidth: 2,
      trailingComma: {
        objects: true
      } as any
    })
  }

  /**
   * Load all configuration files in path.
   */
  public static async loadAll(
    path = Path.config(),
    safe = false
  ): Promise<void> {
    if (extname(path)) {
      safe ? await this.safeLoad(path) : await this.load(path)

      return
    }

    const files = await Module.getAllJSFilesFrom(path)

    this.fatherConfigPath = path

    await Exec.concurrently(files, file =>
      safe ? this.safeLoad(file.path) : this.load(file.path)
    )
  }

  /**
   * Load the configuration file only if it has
   * not been loaded yet.
   */
  public static async safeLoad(
    path: string,
    callNumber?: number
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
      debug(
        'Configuration file path %s does not exist, and will be skipped.',
        path
      )

      return
    }

    const { dir, name, base, ext } = parse(path)

    if (callNumber > 500) {
      throw new RecursiveConfigException(path, name)
    }

    if (base.includes('.js.map') || base.includes('.d.ts')) {
      debug(
        'Configuration file %s being skipped since its extension is not valid.',
        base
      )

      return
    }

    if (base.includes('.ts') && Env('IS_TS') === false) {
      debug(
        'Configuration file %s being skipped since its a TypeScript file and the application is not running in a TypeScript environment.',
        base
      )

      return
    }

    const file = new File(path).loadSync()
    const fileContent = file.getContentSync().toString()

    if (fileContent.includes('Config.get')) {
      const matches = fileContent.match(/Config.get\(([^)]+)\)/g)

      for (let match of matches) {
        match = match.replace('Config.get', '').replace(/[(^)'"]/g, '')

        const fileName = `${match.split('.')[0]}`
        const fileBase = `${fileName}${ext}`
        const filePath = `${dir}/${fileBase}`

        debug('Nested configuration found, loading file %s first.', fileBase)

        await this.safeLoad(filePath, callNumber + 1)
      }
    }

    let configKey = name

    if (this.fatherConfigPath) {
      configKey = path
        .replace(`${this.fatherConfigPath}${sep}`, '')
        .replace(ext, '')

      let pattern = `${sep}`

      if (sep === '\\') {
        pattern = `\\\\`
      }

      configKey = configKey.replace(new RegExp(pattern, 'g'), '.')
    }

    /**
     * Add random number to file an import path so
     * Node.js will not cache the imported file.
     */
    file.href = `${file.href}?version=${Math.random()}`

    debug(
      'Loading configuration file %s with configuration key as %s.',
      file.href,
      configKey
    )

    this.configs.set(configKey, await file.import())
    this.paths.set(configKey, file.path)
  }
}
