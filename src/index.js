/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Debug } from '@secjs/utils'
import { EnvHelper } from '#src/Helpers/EnvHelper'

export * from './Helpers/EnvHelper.js'

/**
 * Return the env value if found or the fallback defaultValue.
 *
 * @param {string} env
 * @param {any} [defaultValue]
 * @param {boolean} [autoCast]
 */
export function Env(env, defaultValue, autoCast = true) {
  const environment = EnvHelper.setEnvInEnv(process.env[env], autoCast)

  if (!environment) {
    Debug.log(`Variable ${env} not found.`, 'api:environments')

    return EnvHelper.setEnvInEnv(defaultValue, autoCast)
  }

  if (autoCast) {
    return EnvHelper.castEnv(environment)
  }

  return environment
}

if (!global.Env) {
  global.Env = Env
}
