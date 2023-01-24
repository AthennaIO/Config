/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class RecursiveConfigException extends Exception {
  /**
   * Creates a new instance of RecursiveConfigException.
   */
  public constructor(filePath: string, configName: string) {
    super({
      status: 500,
      code: 'E_CONFIG_RECURSIVE',
      help: `Remove the Config.get('${configName}') in the file ${filePath}`,
      message: `Your configuration file ${filePath} is using Config.get() to an other configuration file that is using a Config.get('${configName}*'), creating an infinite recursive call.`,
    })
  }
}
