/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'

import { File, Folder, Path } from '@athenna/common'
import { RecursiveConfigException } from '#src/Exceptions/RecursiveConfigException'
import { ConfigNotNormalizedException } from '#src/Exceptions/ConfigNotNormalizedException'

test.group('ConfigTest', group => {
  group.setup(async () => {
    await new Folder(Path.stubs('config')).copy(Path.config())
    await new File(Path.config('recursiveOne.js')).remove()
    await new File(Path.config('recursiveTwo.js')).remove()
    await new File(Path.config('notNormalized.js')).remove()

    await Config.loadAll()
  })

  group.teardown(async () => {
    await new Folder(Path.config()).remove()
  })

  test('should be able to get all configurations values from Config class', ({ assert }) => {
    const configs = Config.get()

    assert.deepEqual(configs.app, { name: 'Athenna', env: 'test' })
    assert.deepEqual(configs.database, { username: 'Athenna' })
  })

  test('should be able to get full configurations values of one file from Config class', ({ assert }) => {
    const app = Config.get('app')

    assert.deepEqual(app, {
      name: 'Athenna',
      env: 'test',
    })
  })

  test('should be able to fallback to default values when the config does not exist', async ({ assert }) => {
    assert.equal(Config.get('http.noExist', 'Hello World'), 'Hello World')
    assert.equal(Config.get('noExistConfig.test', 'Hello World'), 'Hello World')
  })

  test('should be able to create a load chain when a configuration uses other configuration', ({ assert }) => {
    assert.equal(Config.get('app.name'), 'Athenna')
    assert.equal(Config.get('database.username'), 'Athenna')
  })

  test('should throw an error when loading a file that is trying to use Config.get() to get information from other config file but this config file is trying to use Config.get() to this same file', async ({
    assert,
  }) => {
    const useCase = async () => await Config.load(Path.stubs('config/recursiveOne.js'))

    await assert.rejects(useCase, RecursiveConfigException)
  })

  test('should throw an error when trying to load a file that is not normalized', async ({ assert }) => {
    const useCase = async () => await Config.load(Path.stubs('config/notNormalized.js'))

    await assert.rejects(useCase, ConfigNotNormalizedException)
  })

  test('should not load .map/.d.ts files', async ({ assert }) => {
    await Config.load(Path.config('app.d.ts'))
    await Config.load(Path.config('app.js.map'))

    assert.equal(Config.get('app.name'), 'Athenna')
  })

  test('should be able to reload configuration values', async ({ assert }) => {
    assert.equal(Config.get('app.env'), 'test')

    process.env.NODE_ENV = 'example'

    Config.configs.clear()

    await Config.safeLoad(Path.config('app.js'))
    await Config.safeLoad(Path.config('database.js'))

    assert.equal(Config.get('app.env'), 'example')
  })
})
