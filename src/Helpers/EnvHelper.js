/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import dotenv from 'dotenv'
import { Debug, Is, Path } from '@secjs/utils'

import { Env } from '#src/index'

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
  static setEnvInEnv(environment, autoCast) {
    if (!Is.String(environment)) {
      return environment
    }

    const matches = environment.match(/\${([^}]+)}/g)

    if (!matches) {
      return environment
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

    return environment
  }

  /**
   * Cast the environment variable if matches
   * the cast reserved vars -> (). If the var
   * doesnt match, returns the same variable value.
   *
   * @param {string} environment
   * @return {any}
   */
  static castEnv(environment) {
    if (environment.match(/\((.*?)\)/)) {
      environment = environment.slice(1, -1)

      /**
       * Is.Json(environment) will be true if values
       * are boolean string and also number string.
       *
       * JSON.parse also can cast this type of values.
       */
      if (Is.Json(environment)) {
        return JSON.parse(environment)
      }
    }

    return environment
  }

  /**
   * Resolve the env file according to NODE_ENV
   * environment variable.
   *
   * @return {void}
   */
  static resolveFile() {
    const environment = process.env.NODE_ENV
    const configurations = {
      path: Path.pwd('.env'),
      override: this.isToOverrideEnvs(),
    }

    if (environment && environment !== '' && environment !== 'production') {
      configurations.path = Path.pwd(`.env.${environment}`)

      Debug.log(
        `Environment variables set using .env.${environment} file.`,
        'api:environments',
      )
    }

    const result = dotenv.config(configurations)

    if (result.error) {
      Debug.log('Any environment variable file found.', 'api:environments')
    }
  }

  /**
   * Verify if envs preset in process.env should be override
   * by envs that are set inside .env files.
   *
   * @return {""|boolean}
   */
  static isToOverrideEnvs() {
    return (
      process.env.OVERRIDE_ENV &&
      (process.env.OVERRIDE_ENV === true ||
        process.env.OVERRIDE_ENV === 'true' ||
        process.env.OVERRIDE_ENV === '(true)')
    )
  }
}
