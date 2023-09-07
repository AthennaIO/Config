/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import dotenv from 'dotenv'

import { Env } from '#src'
import { debug } from '#src/debug'
import { File, Is, Path } from '@athenna/common'

export class EnvHelper {
  /**
   * Replace environment values found inside other
   * environment values.
   *
   * Example: TEST_ENV=${MY_ENV}_Hello -> Env('TEST_ENV') -> env_Hello
   */
  public static setEnvInEnv<T = any>(environment: any, autoCast: boolean): T {
    if (!Is.String(environment)) {
      return environment
    }

    const matches = environment.match(/\${([^}]+)}/g)

    if (!matches) {
      return environment as T
    }

    matches.forEach(match => {
      const key = match.replace(/[!${}]+/g, '')

      match = match.replace('$', '\\$')

      let value = Env(key, '', autoCast)

      if (Is.Object(value)) {
        value = JSON.stringify(value)
      }

      environment = environment.replace(new RegExp(match, 'g'), value)
    })

    return environment as T
  }

  /**
   * Cast the environment variable if it values matches a
   * number string, boolean string, or json string.
   */
  public static castEnv(environment: string): any {
    if (/^-?\d+$/.test(environment)) {
      return +environment
    }

    if (environment === 'true' || environment === 'false') {
      return environment === 'true'
    }

    if (Is.Json(environment)) {
      return JSON.parse(environment)
    }

    return environment
  }

  /**
   * Resolve the env file according to APP_ENV or NODE_ENV
   * environment variable.
   */
  public static resolveFile(lookupNodeEnv = false): void {
    const environment = this.getAppEnv(lookupNodeEnv)
    const configurations = {
      path: Path.pwd('.env'),
      override: this.isToOverrideEnvs()
    }

    if (environment) {
      configurations.path = Path.pwd(`.env.${environment}`)
    }

    if (configurations.override) {
      debug('Environment variables override is enabled.')
    }

    debug('Loading env file %s path.', configurations.path)

    dotenv.config(configurations)
  }

  /**
   * Resolve some env file path.
   */
  public static resolveFilePath(
    path = Path.pwd('.env'),
    override = this.isToOverrideEnvs()
  ): void {
    dotenv.config({ path, override })
  }

  /**
   * Verify if envs preset in process.env should be override
   * by envs that are set inside .env files.
   */
  public static isToOverrideEnvs(): boolean {
    return this.isEnvTrue(process.env.OVERRIDE_ENV)
  }

  /**
   * Verify if the env variable is true, 'true' or '(true)'.
   */
  public static isEnvTrue(env: string): boolean {
    return env && (env === 'true' || env === '(true)')
  }

  /**
   * Get the APP_ENV or NODE_ENV variable from process.env or
   * from the .env file if exists in project root.
   */
  public static getAppEnv(lookupNodeEnv: boolean): string {
    const appEnv = process.env.APP_ENV || process.env.NODE_ENV

    if (this.isDefinedEnv(appEnv)) {
      debug(
        'Application environment defined by %s env variable.',
        process.env.APP_ENV ? 'APP_ENV' : 'NODE_ENV'
      )

      return appEnv
    }

    if (!lookupNodeEnv) {
      debug(
        'Lookup of APP_ENV/NODE_ENV env variables are disabled, skipping it.'
      )

      return null
    }

    if (!File.existsSync(Path.pwd('.env'))) {
      debug(
        'Unable to found env file at application root: %s. Skipping APP_ENV/NODE_ENV lookup.',
        Path.pwd('.env')
      )

      return null
    }

    const content = new File(Path.pwd('.env')).getContentAsStringSync()

    if (!content) {
      debug(
        'File %s content is empty, Skipping APP_ENV/NODE_ENV lookup.',
        Path.pwd('.env')
      )

      return null
    }

    if (content.includes('APP_ENV')) {
      return this.getEnvFromString('APP_ENV', content)
    }

    if (content.includes('NODE_ENV')) {
      return this.getEnvFromString('NODE_ENV', content)
    }

    return null
  }

  /**
   * Get the env value from .env file.
   */
  public static getEnvFromString(envName: string, content: string) {
    let value = content.split(`${envName}=`)[1]

    if (value.includes('\n')) {
      value = value.split('\n')[0]
    }

    const serializedValue = value
      .replace(/'/g, '')
      .replace(/"/g, '')
      .replace(/\r/g, '')

    if (
      this.isDefinedEnv(serializedValue) &&
      File.existsSync(Path.pwd(`.env.${serializedValue}`))
    ) {
      process.env[envName] = serializedValue

      debug(
        'Found %s env variable with value %s inside %s file, returning it as environment value.',
        envName,
        serializedValue,
        Path.pwd(`.env.${serializedValue}`)
      )

      return process.env[envName]
    }

    return null
  }

  /**
   * Verify if some environment is defined ignoring.
   */
  public static isDefinedEnv(environment: string) {
    return (
      environment &&
      environment !== '' &&
      environment !== 'undefined' &&
      environment !== 'production'
    )
  }
}
