/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class NotValidArrayConfigException extends Exception {
  public constructor(key: string) {
    super({
      status: 500,
      code: 'E_NOT_VALID_CONFIG_ARRAY',
      message: `The configuration ${key} is not a valid array, and it is not possible to push values to it.`,
      help: `Try changing your configuration key when calling push and pushAll methods or transform the value of your configuration ${key} to an array.`,
    })
  }
}
