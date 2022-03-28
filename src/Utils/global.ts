/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Env as EnvFunction } from '../Env'
import { Config as ConfigClass } from '../Config'

const _global = global as any

_global.Env = EnvFunction
_global.Config = ConfigClass

export {}

declare global {
  const Env: typeof EnvFunction
  const Config: typeof ConfigClass
}
