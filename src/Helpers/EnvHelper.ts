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
   * number string, boolean string or json string. Also,
   * if the variable has the reserved vars -> () enclosed
   * it will be removed and returned as string. So the value
   * (false) in .env is equals to 'false' but the value 10 is
   * equals to number 10.
   */
  public static castEnv(environment: string): any {
    if (environment.match(/\((.*?)\)/)) {
      environment = environment.slice(1, -1)

      return environment
    }

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
   * Resolve the env file according to NODE_ENV
   * environment variable.
   */
  public static resolveFile(lookupNodeEnv = false): void {
    const environment = this.getNodeEnv(lookupNodeEnv)
    const configurations = {
      path: Path.pwd('.env'),
      override: this.isToOverrideEnvs(),
    }

    if (environment) {
      configurations.path = Path.pwd(`.env.${environment}`)
    }

    dotenv.config(configurations)
  }

  /**
   * Resolve some env file path.
   */
  public static resolveFilePath(
    path = Path.pwd('.env'),
    override = this.isToOverrideEnvs(),
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
   * Get the NODE_ENV variable from process.env or from the
   * .env file if exists in project root.
   */
  public static getNodeEnv(lookupNodeEnv: boolean): string {
    if (this.isDefinedEnv(process.env.NODE_ENV)) {
      return process.env.NODE_ENV
    }

    if (!lookupNodeEnv) {
      return null
    }

    const file = new File(Path.pwd('.env'), '')

    if (!file.fileExists) {
      return null
    }

    const content = file.getContentAsStringSync()

    if (content && content.includes('NODE_ENV=')) {
      let value = content.split('NODE_ENV=')[1]

      if (value.includes('\n')) {
        value = value.split('\n')[0]
      }

      const serializedValue = value
        .replace(/'/g, '')
        .replace(/"/g, '')
        .replace(/\r/g, '')

      if (this.isDefinedEnv(serializedValue)) {
        const file = new File(Path.pwd(`.env.${serializedValue}`), '')

        if (!file.fileExists) {
          return null
        }

        process.env.NODE_ENV = serializedValue

        return process.env.NODE_ENV
      }

      return null
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
