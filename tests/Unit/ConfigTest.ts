/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { File, Folder, Path } from '@athenna/common'
import { Test, BeforeAll, AfterAll, TestContext, Cleanup } from '@athenna/test'
import { RecursiveConfigException } from '#src/Exceptions/RecursiveConfigException'

export default class ConfigTest {
  @BeforeAll()
  public async beforeAll() {
    await new Folder(Path.stubs('config')).copy(Path.config())
    await new File(Path.config('recursiveOne.ts')).remove()
    await new File(Path.config('recursiveTwo.ts')).remove()
    await new File(Path.config('notNormalized.ts')).remove()

    await Config.loadAll()
  }

  @AfterAll()
  public async afterAll() {
    await Folder.safeRemove(Path.config())
  }

  @Test()
  public async shouldBeAbleToGetAllConfigurationsValuesFromConfigClass({ assert }: TestContext) {
    const configs = Config.get()

    assert.deepEqual(configs.app, { name: 'Athenna', env: 'test' })
    assert.deepEqual(configs.database, { username: 'Athenna', env: 'test' })
  }

  @Test()
  public async shouldBeAbleToGetFullConfigurationsValuesOfOneFileFromConfigClass({ assert }: TestContext) {
    const app = Config.get('app')

    assert.deepEqual(app, {
      name: 'Athenna',
      env: 'test',
    })
  }

  @Test()
  public async shouldBeAbleToFallbackToDefaultValuesWhenTheConfigDoesNotExist({ assert }: TestContext) {
    assert.equal(Config.get('http.noExist', 'Hello World'), 'Hello World')
    assert.equal(Config.get('noExistConfig.test', 'Hello World'), 'Hello World')
  }

  @Test()
  public async shouldBeAbleToCreateALoadChainWhenAConfigurationUsesOtherConfiguration({ assert }: TestContext) {
    assert.equal(Config.get('app.name'), 'Athenna')
    assert.equal(Config.get('database.username'), 'Athenna')
  }

  @Test()
  public async shouldBeAbleToVerifyConfigurationsExistence({ assert }: TestContext) {
    assert.isTrue(Config.exists('app.name'))
    assert.isTrue(Config.existsAll('app.name', 'app.env'))
    assert.isFalse(Config.exists('notFound'))
    assert.isFalse(Config.exists('app.notFound'))
    assert.isFalse(Config.exists('app.name.notFound'))
    assert.isFalse(Config.existsAll(['app.name.notFound1', 'app.name.notFound2']))
  }

  @Test()
  public async shouldBeAbleToVerifyConfigurationsNegativeExistence({ assert }: TestContext) {
    assert.isFalse(Config.notExists('app.name'))
    assert.isFalse(Config.notExistsAll('app.name', 'app.env'))
    assert.isTrue(Config.notExists('notFound'))
    assert.isTrue(Config.notExists('app.notFound'))
    assert.isTrue(Config.notExists('app.name.notFound'))
    assert.isTrue(Config.notExistsAll(['app.name.notFound1', 'app.name.notFound2']))
  }

  @Test()
  public async shouldBeAbleToVerifyIfConfigurationsHasSomeValue({ assert }: TestContext) {
    assert.isTrue(Config.is('app.name', 'Athenna'))
    assert.isTrue(Config.is('app.name', 'Wrong', 'WrongAgain', 'Athenna'))
    assert.isTrue(Config.is('app.name', ['Wrong', 'WrongAgain', 'Athenna']))
    assert.isFalse(Config.is('notFound', 'Athenna'))
    assert.isFalse(Config.is('app.name', 'Hello'))
  }

  @Test()
  public async shouldBeAbleToVerifyIfConfigurationsHasNotSomeValue({ assert }: TestContext) {
    assert.isFalse(Config.isNot('app.name', 'Athenna'))
    assert.isFalse(Config.isNot('app.name', 'Wrong', 'WrongAgain', 'Athenna'))
    assert.isTrue(Config.isNot('notFound', 'Athenna'))
    assert.isTrue(Config.isNot('app.name', 'Hello'))
  }

  @Test()
  public async shouldBeAbleToSetValuesInConfigurations({ assert }: TestContext) {
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
  }

  @Test()
  public async shouldBeAbleToSafeSetValuesInConfigurations({ assert }: TestContext) {
    const mainConfig = Config.get('app')

    Config.set('app.name.mainName', 'Athenna')
    Config.safeSet('app.name.otherName', 'WillDefine')
    Config.safeSet('app.name.mainName', 'WillNotDefine')

    assert.equal(Config.get('app.name.mainName'), 'Athenna')
    assert.equal(Config.get('app.name.otherName'), 'WillDefine')

    Config.set('app', mainConfig)
  }

  @Test()
  public async shouldBeAbleToDeleteValuesFromConfigurations({ assert }: TestContext) {
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
  }

  @Test()
  public async shouldThrownAnErrorWhenLoadingAConfigurationFileThatRecursivellyLoadsOther({ assert }: TestContext) {
    const useCase = async () => await Config.load(Path.stubs('config/recursiveOne.ts'))

    await assert.rejects(useCase, RecursiveConfigException)
  }

  @Test()
  public async shouldNotLoadMapAndDTSFiles({ assert }: TestContext) {
    await Config.load(Path.config('app.d.ts'))
    await Config.load(Path.config('app.js.map'))

    assert.equal(Config.get('app.name'), 'Athenna')
  }

  @Test()
  public async shouldBeAbleToRealodConfigurationValues({ assert }: TestContext) {
    assert.equal(Config.get('app.env'), 'test')

    process.env.NODE_ENV = 'example'

    Config.clear()

    await Config.safeLoad(Path.config('app.ts'))
    await Config.safeLoad(Path.config('database.ts'))

    assert.equal(Config.get('app.env'), 'example')
  }

  @Test()
  public async shouldNotThrowErrorsIfConfigurationPathDoesNotExistInLoad({ assert }: TestContext) {
    const path = Path.stubs('not-found.ts')

    assert.isFalse(await File.exists(path))
    assert.isUndefined(await Config.load(path))
  }

  @Test()
  public async shouldNotThrowErrorsIfConfigurationPathDoesNotExistInSafeLoad({ assert }: TestContext) {
    const path = Path.stubs('not-found.ts')

    assert.isFalse(await File.exists(path))
    assert.isUndefined(await Config.safeLoad(path))
  }

  @Test()
  public async shouldNotThrowErrorsIfConfigurationPathDoesNotExistInLoadAll({ assert }: TestContext) {
    const path = Path.stubs('not-found/path')

    assert.isFalse(await Folder.exists(path))
    assert.isUndefined(await Config.loadAll(path))
  }

  @Test()
  @Cleanup(() => Config.delete('app'))
  public async shouldBeAbleToLoadAllConfigurationPathSafelly({ assert }: TestContext) {
    Config.set('app', {})

    await Config.loadAll(Path.config(), true)

    assert.deepEqual(Config.get('app'), {})
  }

  @Test()
  @Cleanup(() => (process.env.IS_TS = 'true'))
  public async shouldBeAbleToLoadAllJsFilesButNotTsFilesWhenEnvTsIsFalse({ assert }: TestContext) {
    process.env.IS_TS = 'false'

    await Config.loadAll(Path.stubs('jsconfig'), false)

    assert.equal(Config.get('app.name'), 'AthennaJS')
  }
}
