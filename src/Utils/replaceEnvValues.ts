/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Env } from '../Env'
import { Is } from '@secjs/utils'

/**
 * Replace env values found inside other env values
 *
 * Example: TEST_ENV=${MY_ENV}_Hello -> Env('TEST_ENV') -> env_Hello
 */
export function replaceEnvValues(environment: any, autoCast = true): string {
  if (!Is.String(environment)) return environment

  const matches = environment.match(/\${([^}]+)}/g)

  if (matches) {
    for (let match of matches) {
      const key = match.replace(/[!${}]+/g, '')

      match = match.replace('$', '\\$')

      let value = Env(key, '', autoCast)

      if (Is.Object(value)) {
        value = JSON.stringify(value)
      }

      environment = environment.replace(new RegExp(match, 'g'), value)
    }
  }

  return environment
}
