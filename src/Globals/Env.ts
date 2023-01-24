/**
 * @athenna/config
 *
 * (c) Victor Tesoura Júnior <txsoura@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Env } from '#src/Env/Env'

declare global {
  export const Env: Env
}

const __global: any = global
if (!__global.Env) {
  __global.Env = Env
}
