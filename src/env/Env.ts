/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EnvHelper } from '#src/helpers/EnvHelper'

/**
 * Return the env value if found or the defaultValue.
 * Env function will also autoCast boolean and number
 * string values.
 */
export function Env<T = any>(
  env: string,
  defaultValue?: any,
  autoCast = true,
): T {
  const environment = EnvHelper.setEnvInEnv(process.env[env], autoCast)

  if (!environment) {
    return EnvHelper.setEnvInEnv(defaultValue, autoCast)
  }

  if (autoCast) {
    return EnvHelper.castEnv(environment)
  }

  return environment
}
