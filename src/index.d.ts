export class EnvHelper {
  /**
   * Replace environment values found inside other
   * environment values.
   *
   * Example: TEST_ENV=${MY_ENV}_Hello -> Env('TEST_ENV') -> env_Hello
   *
   * @param {any} environment
   * @param {boolean} autoCast
   * @return {string}
   */
  static setEnvInEnv(environment: any, autoCast: boolean): string

  /**
   * Cast the environment variable if matches
   * the cast reserved vars -> (). If the var
   * doesnt match, returns the same variable value.
   *
   * @param {string} environment
   * @return {any}
   */
  static castEnv(environment: string): any

  /**
   * Resolve the env file according to NODE_ENV
   * environment variable.
   *
   * @return {void}
   */
  static resolveFile(): void
}

/**
 * Return the env value if found or the fallback defaultValue.
 *
 * @param {string} env
 * @param {any} [defaultValue]
 * @param {boolean} [autoCast]
 */
export function Env(env: string, defaultValue?: any, autoCast?: boolean): any

export class Config {
  /**
   * Map structure to save all configuration files.
   *
   * @type {Map<string, any>}
   */
  static configs: Map<string, any>

  /**
   * Verify if configuration key has the same value.
   *
   * @param {string} key
   * @param {any|any[]} values
   * @return {boolean}
   */
  static is(key: string, values: any | any[]): boolean
  static is(key: string, ...values: any[]): boolean

  /**
   * Verify if configuration key does not have the same value.
   *
   * @param {string} key
   * @param {any|any[]} values
   * @return {boolean}
   */
  static isNot(key: string, values: any | any[]): boolean
  static isNot(key: string, ...values: any[]): boolean

  /**
   * Verify if configuration key exists.
   *
   * @param {string} key
   * @return {boolean}
   */
  static exists(key: string): boolean

  /**
   * Verify if configuration key does not exist.
   *
   * @param {string} key
   * @return {boolean}
   */
  static notExists(key: string): boolean

  /**
   * Verify if configuration keys exists.
   *
   * @param {string[]} keys
   * @return {boolean}
   */
  static existsAll(keys: string): boolean
  static existsAll(keys: string[]): boolean
  static existsAll(...keys: string[]): boolean

  /**
   * Verify if configuration keys not exists.
   *
   * @param {string[]} keys
   * @return {boolean}
   */
  static notExistsAll(keys: string): boolean
  static notExistsAll(keys: string[]): boolean
  static notExistsAll(...keys: string[]): boolean

  /**
   * Set a value in the configuration key.
   *
   * @param {string} key
   * @param {any|any[]} value
   * @return {typeof Config}
   */
  static set(key: string, value: any | any[]): typeof Config

  /**
   * Delete the configuration key.
   *
   * @param {string} key
   * @return {typeof Config}
   */
  static delete(key: string): typeof Config

  /**
   * Get the value from config file by key. If not
   * found, defaultValue will be used.
   *
   * @param {string} [key]
   * @param {any,undefined} [defaultValue]
   * @return {any}
   */
  static get(key?: string, defaultValue?: any): any

  /**
   * Load all configuration files in path.
   *
   * @param {string} path
   * @return {Promise<void>}
   */
  static loadAll(path?: string): Promise<void>

  /**
   * Load the configuration file only if it has
   * not been loaded yet.
   *
   * @param {string} path
   * @param {number?} callNumber
   * @return {Promise<void>}
   */
  static safeLoad(path, callNumber?: number): Promise<void>

  /**
   * Load the configuration file.
   *
   * @param {string} path
   * @param {number?} callNumber
   * @return {Promise<void>}
   */
  static load(path: string, callNumber?: number): Promise<void>
}

declare global {
  /**
   * Return the env value if found or the fallback defaultValue.
   *
   * @param {string} env
   * @param {any} [defaultValue]
   * @param {boolean} [autoCast]
   */
  export function Env(env: string, defaultValue?: any, autoCast?: boolean): any

  export class Config {
    /**
     * Map structure to save all configuration files.
     *
     * @type {Map<string, any>}
     */
    static configs: Map<string, any>

    /**
     * Verify if configuration key has the same value.
     *
     * @param {string} key
     * @param {any|any[]} values
     * @return {boolean}
     */
    static is(key: string, values: any | any[]): boolean
    static is(key: string, ...values: any[]): boolean

    /**
     * Verify if configuration key does not have the same value.
     *
     * @param {string} key
     * @param {any|any[]} values
     * @return {boolean}
     */
    static isNot(key: string, values: any | any[]): boolean
    static isNot(key: string, ...values: any[]): boolean

    /**
     * Verify if configuration key exists.
     *
     * @param {string} key
     * @return {boolean}
     */
    static exists(key: string): boolean

    /**
     * Verify if configuration key does not exist.
     *
     * @param {string} key
     * @return {boolean}
     */
    static notExists(key: string): boolean



    /**
     * Set a value in the configuration key.
     *
     * @param {string} key
     * @param {any|any[]} value
     * @return {typeof Config}
     */
    static set(key: string, value: any | any[]): typeof Config

    /**
     * Delete the configuration key.
     *
     * @param {string} key
     * @return {typeof Config}
     */
    static delete(key: string): typeof Config

    /**
     * Get the value from config file by key. If not
     * found, defaultValue will be used.
     *
     * @param {string} [key]
     * @param {any,undefined} [defaultValue]
     * @return {any}
     */
    static get(key?: string, defaultValue?: any): any

    /**
     * Load all configuration files in path.
     *
     * @param {string} path
     * @return {Promise<void>}
     */
    static loadAll(path?: string): Promise<void>

    /**
     * Load the configuration file only if it has
     * not been loaded yet.
     *
     * @param {string} path
     * @param {number?} callNumber
     * @return {Promise<void>}
     */
    static safeLoad(path, callNumber?: number): Promise<void>

    /**
     * Load the configuration file.
     *
     * @param {string} path
     * @param {number?} callNumber
     * @return {Promise<void>}
     */
    static load(path: string, callNumber?: number): Promise<void>
  }
}
