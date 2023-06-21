/**
 * @athenna/config
 *
 * (c) Victor Tesoura Júnior <txsoura@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config as ConfigImpl } from '#src/config/Config'

declare global {
  export class Config extends ConfigImpl {}
}

const __global: any = global

if (!__global.Config) {
  __global.Config = ConfigImpl
}
