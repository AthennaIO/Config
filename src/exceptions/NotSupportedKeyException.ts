/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class NotSupportedKeyException extends Exception {
  public constructor(key: string) {
    const possibleConfigFileName = key.split('.')[0]

    super({
      status: 500,
      code: 'E_NOT_SUPPORTED_KEY',
      message: `Rewriting a single key such as ({bold,yellow} "${key}") in your configuration file is not supported.`,
      help: `To rewrite the key ({bold,yellow} "${key}") in your configuration file you can simple use the ({bold,green} "Config.set('${key}', ...)") method first. Then, you can use the ({bold,green} "Config.rewrite('${possibleConfigFileName}')") method to rewrite the entire configuration file.`,
    })
  }
}
