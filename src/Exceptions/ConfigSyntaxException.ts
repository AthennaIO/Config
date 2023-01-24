/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class ConfigSyntaxException extends Exception {
  /**
   * Creates a new instance of ConfigSyntaxException.
   */
  public constructor(error: any, fileBase: string) {
    const [_, href, stringErr] = error.annotated.split('\n')

    super({
      status: 500,
      code: 'E_CONFIG_SYNTAX',
      help: `${
        error.message
      } at:\n     ({red, bold} ${stringErr.trim()})\n     ${href}`,
      message: `Syntax error found at ({yellow, bold} ${fileBase}:${error.line}) configuration file.`,
    })
  }
}
