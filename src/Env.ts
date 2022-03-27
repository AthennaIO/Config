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
import { replaceEnvValues } from 'src/Utils/replaceEnvValues'

/**
 * Return the env value if found or the fallback defaultValue
 *
 * @param env
 * @param defaultValue
 */
export function Env<EnvType = any>(
  env: string | EnvContract,
  defaultValue?: any,
): EnvType {
  const debug = new Debug(Env.name, 'api:environments')

  const environment = replaceEnvValues(
    process.env[`${Is.String(env) ? env : env.name}`] as string,
  )

  if (!environment) {
    debug.log(`Variable ${env} not found`)

    return replaceEnvValues(defaultValue)
  }

  if (Is.String(env)) {
    return environment
  }

  const envContract: EnvContract = env as EnvContract

  switch (envContract.type) {
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
