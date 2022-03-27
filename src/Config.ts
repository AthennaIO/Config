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
  /**
   * Get the value from config file from key or fallback in defaultValue
   * @param key
   * @param defaultValue
   */
  static get<ConfigType = any>(
    key: string,
    defaultValue: any = undefined,
  ): ConfigType | undefined {
    return SecConfig.get(key, defaultValue)
  }

  /**
   * Load all the files that are inside the configPath
   * @param configPath Default is the config path in the root of the project
   */
  static load(configPath = Path.config()) {
    const configFolder = new Folder(configPath).loadSync()

    for (const file of configFolder.files) {
      new SecConfig().safeLoad(file.path)
    }
  }
}
