/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'

import { Folder, Path } from '@secjs/utils'

test.group('ConfigTest', group => {
  group.setup(async () => {
    await new Folder(Path.stubs('config')).copy(Path.config())
  })

  group.teardown(async () => {
    await new Folder(Path.config()).remove()
  })

  test('should be able to load all config files from config folder', async ({ assert }) => {
    await Config.load()

    assert.equal(Config.get('http.http'), 'test')
    assert.equal(Config.get('database.database'), 'test')
  })

  test('should be able to get the full value of some config file', async ({ assert }) => {
    await Config.load()

    assert.deepEqual(Config.get('http'), {
      http: 'test',
    })
  })

  test('should be able to fallback to default values when the config does not exist', async ({ assert }) => {
    await Config.load()

    assert.equal(Config.get('http.noExist', 'Hello World'), 'Hello World')
    assert.equal(Config.get('noExistConfig.test', 'Hello World'), 'Hello World')
  })
})
