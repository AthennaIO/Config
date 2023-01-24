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
import { ConfigSyntaxException } from '#src/Exceptions/ConfigSyntaxException'
import { RecursiveConfigException } from '#src/Exceptions/RecursiveConfigException'

test.group('ConfigTest', group => {
  group.setup(async () => {
    await new Folder(Path.stubs('config')).copy(Path.config())
    await new File(Path.config('recursiveOne.ts')).remove()
    await new File(Path.config('recursiveTwo.ts')).remove()
    await new File(Path.config('notNormalized.ts')).remove()

    await Config.loadAll()
  })

  group.teardown(async () => {
    await Folder.safeRemove(Path.config())
    await File.safeRemove(Path.stubs('syntaxError.ts'))
  })

  test('should be able to get all configurations values from Config class', ({ assert }) => {
    const configs = Config.get()

    assert.deepEqual(configs.app, { name: 'Athenna', env: 'test' })
    assert.deepEqual(configs.database, { username: 'Athenna', env: 'test' })
  })

  test('should be able to get full configurations values of one file from Config class', ({ assert }) => {
    const app = Config.get('app')

    assert.deepEqual(app, {
      name: 'Athenna',
      env: 'test',
    })
  })

  test('should be able to fallback to default values when the Config does not exist', async ({ assert }) => {
    assert.equal(Config.get('http.noExist', 'Hello World'), 'Hello World')
    assert.equal(Config.get('noExistConfig.test', 'Hello World'), 'Hello World')
  })

  test('should be able to create a load chain when a configuration uses other configuration', ({ assert }) => {
    assert.equal(Config.get('app.name'), 'Athenna')
    assert.equal(Config.get('database.username'), 'Athenna')
  })

  test('should be able to verify if configurations exists and if has the specified values', ({ assert }) => {
    assert.isTrue(Config.exists('app.name'))
    assert.isTrue(Config.existsAll('app.name', 'app.env'))
    assert.isTrue(Config.is('app.name', 'Athenna'))
    assert.isTrue(Config.is('app.name', 'Wrong', 'WrongAgain', 'Athenna'))
    assert.isTrue(Config.is('app.name', ['Wrong', 'WrongAgain', 'Athenna']))
    assert.isFalse(Config.notExists('app.name'))
    assert.isFalse(Config.notExistsAll('app.name', 'app.env'))
    assert.isFalse(Config.isNot('app.name', 'Athenna'))
    assert.isFalse(Config.isNot('app.name', 'Wrong', 'WrongAgain', 'Athenna'))

    assert.isFalse(Config.exists('notFound'))
    assert.isFalse(Config.exists('app.notFound'))
    assert.isFalse(Config.exists('app.name.notFound'))
    assert.isFalse(Config.existsAll(['app.name.notFound1', 'app.name.notFound2']))
    assert.isTrue(Config.notExists('notFound'))
    assert.isTrue(Config.notExists('app.notFound'))
    assert.isTrue(Config.notExists('app.name.notFound'))
    assert.isTrue(Config.notExistsAll(['app.name.notFound1', 'app.name.notFound2']))

    assert.isFalse(Config.is('notFound', 'Athenna'))
    assert.isFalse(Config.is('app.name', 'Hello'))
    assert.isTrue(Config.isNot('notFound', 'Athenna'))
    assert.isTrue(Config.isNot('app.name', 'Hello'))
  })

  test('should be able to set values in configurations', ({ assert }) => {
    const mainConfig = Config.get('app')

    Config.set('app.name.mainName', 'Athenna')
    Config.set('app.name.subName', 'Framework')

    assert.deepEqual(Config.get('app'), {
      name: {
        mainName: 'Athenna',
        subName: 'Framework',
      },
      env: 'test',
    })

    Config.set('app', { hello: 'world' })
    Config.set('new', { hello: 'world' })
    Config.set('client.url', 'http://localhost:1335')

    assert.deepEqual(Config.get('app'), { hello: 'world' })
    assert.deepEqual(Config.get('new'), { hello: 'world' })
    assert.deepEqual(Config.get('client.url'), 'http://localhost:1335')

    Config.set('app', mainConfig)
  })

  test('should be able to delete values from configurations', ({ assert }) => {
    Config.delete('notFound')

    const mainConfig = Config.get('app')

    assert.isTrue(Config.delete('app').notExistsAll('app.name', 'app.env'))

    Config.set('app', mainConfig)

    assert.isTrue(Config.delete('app.name').notExists('app.name'))
    assert.isTrue(Config.exists('app.env'))

    Config.set('app.name.mainName', 'Athenna')
    Config.set('app.name.subName', 'Framework')

    Config.delete('app.name.mainName')

    assert.isTrue(Config.exists('app.name.subName'))
    assert.isTrue(Config.existsAll('app.name', 'app.env', 'app.name.subName'))

    Config.set('app', mainConfig)
  })

  test('should throw an error when loading a file that is trying to use Config.get() to get information from other Config file but this Config file is trying to use Config.get() to this same file', async ({
    assert,
  }) => {
    const useCase = async () => await Config.load(Path.stubs('config/recursiveOne.ts'))

    await assert.rejects(useCase, RecursiveConfigException)
  })

  test('should not load .map/.d.ts files', async ({ assert }) => {
    await Config.load(Path.config('app.d.ts'))
    await Config.load(Path.config('app.js.map'))

    assert.equal(Config.get('app.name'), 'Athenna')
  })

  test('should be able to reload configuration values', async ({ assert }) => {
    assert.equal(Config.get('app.env'), 'test')

    process.env.NODE_ENV = 'example'

    Config.clear()

    await Config.safeLoad(Path.config('app.ts'))
    await Config.safeLoad(Path.config('database.ts'))

    assert.equal(Config.get('app.env'), 'example')
  })

  test('should be able to check and capture syntax errors inside Config files', async ({ assert }) => {
    await new File(Path.stubs('syntaxError.ts.template')).copy(Path.stubs('syntaxError.ts'))

    await assert.rejects(() => Config.load(Path.stubs('syntaxError.ts')), ConfigSyntaxException)
  })

  test('should not throw errors if configuration path does not exist in load', async ({ assert }) => {
    const path = Path.stubs('not-found.ts')

    assert.isFalse(await File.exists(path))
    assert.isUndefined(await Config.load(path))
  })

  test('should not throw errors if configuration path does not exist in safe load', async ({ assert }) => {
    const path = Path.stubs('not-found.ts')

    assert.isFalse(await File.exists(path))
    assert.isUndefined(await Config.safeLoad(path))
  })

  test('should not throw errors if configuration path does not exist in load all', async ({ assert }) => {
    const path = Path.stubs('not-found/path')

    assert.isFalse(await Folder.exists(path))
    assert.isUndefined(await Config.loadAll(path))
  })
})