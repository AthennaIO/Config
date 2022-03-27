/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EnvTypeENUM } from 'src/Enum/EnvTypeENUM'

export interface EnvContract {
  name: string
  type: EnvTypeENUM
}
