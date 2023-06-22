/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class NotFoundConfigException extends Exception {
  public constructor(key: string) {
    super({
      status: 500,
      code: 'E_NOT_FOUND_CONFIG',
      message: `The configuration ${key} does not exist or the value is a hardcoded undefined.`,
      help: `To solve this problem you can set a default value when trying to get your configuration or setting a value to your ${key} configuration.`,
    })
  }
}
