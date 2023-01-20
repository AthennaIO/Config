/**
 * @athenna/Config
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
    // eslint-disable-next-line no-unused-vars
    const [_, href, stringErr] = error.annotated.split('\n')
    const content = `Syntax error found at ({yellow, bold} ${fileBase}:${error.line}) configuration file.`

    super(
      content,
      500,
      'E_CONFIG_SYNTAX',
      `${
        error.message
      } at:\n     ({red, bold} ${stringErr.trim()})\n     ${href}`,
    )
  }
}
