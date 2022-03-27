/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Folder, Path, Config as SecConfig } from '@secjs/utils'

export class Config {
  static get<ConfigType = any>(
    key: string,
    defaultValue: any = undefined,
  ): ConfigType | undefined {
    return SecConfig.get(key, defaultValue)
  }

  static load(configPath = Path.config()) {
    const configFolder = new Folder(configPath).loadSync()

    for (const file of configFolder.files) {
      new SecConfig().safeLoad(file.path)
    }
  }
}
