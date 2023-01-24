/**
 * @athenna/config
 *
 * (c) Victor Tesoura Júnior <txsoura@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Env as EnvImpl } from '#src/Env/Env'

declare global {
  /**
   * Return the env value if found or the defaultValue.
   * Env function will also autoCast boolean and number
   * string values.
   */
  export function Env<T = any>(
    env: string,
    defaultValue?: any,
    autoCast?: boolean,
  ): T
}

const __global: any = global

if (!__global.EnvImpl) {
  __global.Env = EnvImpl
}
