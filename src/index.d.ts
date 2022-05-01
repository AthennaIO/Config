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
   * Get the value from config file by key. If not
   * found, defaultValue will be used.
   *
   * @param {string} key
   * @param {any,undefined} defaultValue
   * @return {any}
   */
  static get(key: string, defaultValue?: any): any

  /**
   * Load all the files that are inside the path.
   *
   * @param {string} configPath
   * @return {Promise<void>}
   */
  static load(configPath?: string): Promise<void>
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
     * Get the value from config file by key. If not
     * found, defaultValue will be used.
     *
     * @param {string} key
     * @param {any,undefined} defaultValue
     * @return {any}
     */
    static get(key: string, defaultValue?: any): any

    /**
     * Load all the files that are inside the path.
     *
     * @param {string} configPath
     * @return {Promise<void>}
     */
    static load(configPath?: string): Promise<void>
  }
}
