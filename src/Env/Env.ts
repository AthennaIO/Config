/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EnvHelper } from '#src/Helpers/EnvHelper'

/**
 * Return the env value if found or the fallback defaultValue.
 */
export function Env(env: string, defaultValue?, autoCast = true) {
  const environment = EnvHelper.setEnvInEnv(process.env[env], autoCast)

  if (!environment) {
    return EnvHelper.setEnvInEnv(defaultValue, autoCast)
  }

  if (autoCast) {
    return EnvHelper.castEnv(environment)
  }

  return environment
}
