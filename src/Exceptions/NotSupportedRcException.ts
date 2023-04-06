/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class NotSupportedRcException extends Exception {
  public constructor() {
    super({
      status: 500,
      code: 'E_NOT_SUPPORTED_RC',
      message: `Rewriting the athenna rc file using ({bold,yellow} "Config.rewrite()") method is not supported.`,
      help: `To rewrite the values of your athenna rc file you can use the ({bold,green} "Rc") helper imported from ({bold,green} "@athenna/config").`,
    })
  }
}
