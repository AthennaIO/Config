/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '../../src/Config'
import { Folder, Path } from '@secjs/utils'

describe('\n ConfigTest', () => {
  beforeAll(async () => {
    new Folder(Path.tests('Stubs/config')).loadSync().copySync(Path.config())
  })

  it('should be able to load all config files from config folder', async () => {
    await Config.load()

    expect(Config.get('http.http')).toBe('test')
    expect(Config.get('database.database')).toBe('test')
  })

  it('should be able to fallback to default values when the config does not exist', async () => {
    await Config.load()

    expect(Config.get('http.noExist', 'Hello World')).toBe('Hello World')
    expect(Config.get('noExistConfig.test', 'Hello World')).toBe('Hello World')
  })

  afterAll(async () => {
    new Folder(Path.config()).removeSync()
  })
})
