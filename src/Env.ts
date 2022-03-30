/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Debug, Is } from '@secjs/utils'
import { replaceEnvValues } from 'src/Utils/replaceEnvValues'

/**
 * Return the env value if found or the fallback defaultValue
 *
 * @param env The environment variable name
 * @param defaultValue The default value that Env will return if environment variable cannot be found
 * @param autoCast Define that this environment variable should be auto cast using () reserved values
 */
export function Env<EnvType = any>(
  env: string,
  defaultValue?: any,
  autoCast = true,
): EnvType {
  const debug = new Debug(Env.name, 'api:environments')

  let environment = replaceEnvValues(process.env[env] as string, autoCast)

  if (!environment) {
    debug.log(`Variable ${env} not found`)

    return replaceEnvValues(defaultValue, autoCast) as any
  }

  if (autoCast && environment.match(/\((.*?)\)/)) {
    environment = environment.slice(1, -1)

    if (Is.Boolean(environment)) {
      // eslint-disable-next-line eqeqeq
      return (environment == 'true') as any
    }

    if (Is.Number(environment)) {
      return parseInt(environment) as any
    }

    if (Is.Json(environment)) {
      return JSON.parse(environment)
    }
  }

  return environment as any
}
