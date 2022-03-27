/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Debug, Is } from '@secjs/utils'
import { EnvTypeENUM } from 'src/Enum/EnvTypeENUM'
import { EnvContract } from 'src/Contracts/EnvContract'

export function Env<EnvType = any>(
  env: string | EnvContract,
  defaultValue?: any,
): EnvType {
  const debug = new Debug(Env.name, 'api:environments')

  if (Is.String(env)) {
    const environment = process.env[env]

    if (!environment) {
      debug.log(`Variable ${env} not found`)

      return defaultValue
    }

    return environment as any
  }

  let environment = process.env[env.name]

  if (!environment) {
    debug.log(`Variable ${env.name} not found`)

    environment = defaultValue
  }

  switch (env.type) {
    case EnvTypeENUM.NUMBER:
      return parseInt(environment as string) as any
    case EnvTypeENUM.OBJECT:
      return JSON.parse(environment as string)
    case EnvTypeENUM.BOOLEAN:
      // eslint-disable-next-line eqeqeq
      return (environment == 'true') as any
    default:
      return environment as any
  }
}
