/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Env } from '../Env'
import { Config } from '../Config'
import { EnvContract } from 'src/Contracts/EnvContract'

const _global = global as any

_global.Env = Env
_global.Config = Config

export {}

declare global {
  const Env: <EnvType = any>(
    env: string | EnvContract,
    defaultValue?: any,
  ) => EnvType
  const Config: Config
}
