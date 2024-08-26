/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { sep } from 'node:path'
import { File, Json, Folder, Path } from '@athenna/common'
import { Test, Cleanup, BeforeEach, AfterEach, type Context } from '@athenna/test'
import { RecursiveConfigException } from '#src/exceptions/RecursiveConfigException'
import { NotSupportedKeyException } from '#src/exceptions/NotSupportedKeyException'
import { NotValidArrayConfigException } from '#src/exceptions/NotValidArrayConfigException'

export default class ConfigTest {
  public env: any = Json.copy(process.env)
  public argv: string[] = Json.copy(process.argv)

  @BeforeEach()
  public async beforeEach() {
    await Config.load(Path.fixtures('config/app.ts'))
    await Config.load(Path.fixtures('config/database.ts'))
  }

  @AfterEach()
  public async afterEach() {
    Config.clear()
    process.env = Json.copy(this.env)
    process.argv = Json.copy(this.argv)
  }

  @Test()
  public async shouldBeAbleToGetAllConfigurationValuesFromConfigClass({ assert }: Context) {
    const configs = Config.get()

    assert.deepEqual(configs.app, { name: 'Athenna', env: 'test', environments: ['default'] })
    assert.deepEqual(configs.database, { username: 'Athenna', env: 'test' })
  }

  @Test()
  public async shouldBeAbleToGetFullConfigurationsValuesOfOneFileFromConfigClass({ assert }: Context) {
    const app = Config.get('app')

    assert.deepEqual(app, {
      name: 'Athenna',
      env: 'test',
      environments: ['default']
    })
  }

  @Test()
  public async shouldBeAbleToFallbackToDefaultValuesWhenTheConfigDoesNotExist({ assert }: Context) {
    assert.equal(Config.get('http.noExist', 'Hello World'), 'Hello World')
    assert.equal(Config.get('noExistConfig.test', 'Hello World'), 'Hello World')
  }

  @Test()
  public async shouldBeAbleToCreateALoadChainWhenAConfigurationUsesOtherConfiguration({ assert }: Context) {
    assert.equal(Config.get('app.name'), 'Athenna')
    assert.equal(Config.get('database.username'), 'Athenna')
  }

  @Test()
  public async shouldBeAbleToVerifyConfigurationsExistence({ assert }: Context) {
    assert.isTrue(Config.exists('app.name'))
    assert.isTrue(Config.existsAll('app.name', 'app.env'))
    assert.isFalse(Config.exists('notFound'))
    assert.isFalse(Config.exists('app.notFound'))
    assert.isFalse(Config.exists('app.name.notFound'))
    assert.isFalse(Config.existsAll(['app.name.notFound1', 'app.name.notFound2']))
  }

  @Test()
  public async shouldBeAbleToVerifyConfigurationsNegativeExistence({ assert }: Context) {
    assert.isFalse(Config.notExists('app.name'))
    assert.isFalse(Config.notExistsAll('app.name', 'app.env'))
    assert.isTrue(Config.notExists('notFound'))
    assert.isTrue(Config.notExists('app.notFound'))
    assert.isTrue(Config.notExists('app.name.notFound'))
    assert.isTrue(Config.notExistsAll(['app.name.notFound1', 'app.name.notFound2']))
  }

  @Test()
  public async shouldBeAbleToVerifyIfConfigurationsHasSomeValue({ assert }: Context) {
    assert.isTrue(Config.is('app.name', 'Athenna'))
    assert.isTrue(Config.is('app.name', 'Wrong', 'WrongAgain', 'Athenna'))
    assert.isTrue(Config.is('app.name', ['Wrong', 'WrongAgain', 'Athenna']))
    assert.isFalse(Config.is('notFound', 'Athenna'))
    assert.isFalse(Config.is('app.name', 'Hello'))
  }

  @Test()
  public async shouldBeAbleToVerifyIfConfigurationsHasNotSomeValue({ assert }: Context) {
    assert.isFalse(Config.isNot('app.name', 'Athenna'))
    assert.isFalse(Config.isNot('app.name', 'Wrong', 'WrongAgain', 'Athenna'))
    assert.isTrue(Config.isNot('notFound', 'Athenna'))
    assert.isTrue(Config.isNot('app.name', 'Hello'))
  }

  @Test()
  public async shouldBeAbleToSetValuesInConfigurations({ assert }: Context) {
    const mainConfig = Config.get('app')

    Config.set('app.name.mainName', 'Athenna')
    Config.set('app.name.subName', 'Framework')

    assert.deepEqual(Config.get('app'), {
      name: {
        mainName: 'Athenna',
        subName: 'Framework'
      },
      env: 'test',
      environments: ['default']
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
  public async shouldBeAbleToSafeSetValuesInConfigurations({ assert }: Context) {
    const mainConfig = Config.get('app')

    Config.set('app.name.mainName', 'Athenna')
    Config.safeSet('app.name.otherName', 'WillDefine')
    Config.safeSet('app.name.mainName', 'WillNotDefine')

    assert.equal(Config.get('app.name.mainName'), 'Athenna')
    assert.equal(Config.get('app.name.otherName'), 'WillDefine')

    Config.set('app', mainConfig)
  }

  @Test()
  public async shouldBeAbleToPushValuesToConfigurationsThatAreArrays({ assert }: Context) {
    Config.push('app.environments', 'http')
    Config.push('app.environments', ['repl', 'console'])

    assert.deepEqual(Config.get('app.environments'), ['default', 'http', 'repl', 'console'])
  }

  @Test()
  public async shouldBeAbleToPushValuesToConfigurationsThatDoesNotExist({ assert }: Context) {
    Config.push('app.newArray', 'http')
    Config.push('app.newArrayArray', ['repl', 'console'])

    assert.deepEqual(Config.get('app.newArray'), ['http'])
    assert.deepEqual(Config.get('app.newArrayArray'), ['repl', 'console'])
  }

  @Test()
  public async shouldThrowAnExceptionIfTryingToPushValueToAConfigurationThatIsNotAnArray({ assert }: Context) {
    assert.throws(() => Config.push('app.name', 'http'), NotValidArrayConfigException)
  }

  @Test()
  public async shouldBeAbleToDeleteValuesFromConfigurations({ assert }: Context) {
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
  public async shouldThrownAnErrorWhenLoadingAConfigurationFileThatRecursivelyLoadsOther({ assert }: Context) {
    const useCase = async () => await Config.load(Path.fixtures('recursive-config/recursiveOne.ts'))

    await assert.rejects(useCase, RecursiveConfigException)
  }

  @Test()
  public async shouldNotLoadMapAndDTSFiles({ assert }: Context) {
    await Config.load(Path.fixtures('config/app.d.ts'))
    await Config.load(Path.fixtures('config/app.js.map'))

    assert.equal(Config.get('app.name'), 'Athenna')
  }

  @Test()
  public async shouldBeAbleToReloadConfigurationValues({ assert }: Context) {
    assert.equal(Config.get('app.env'), 'test')

    process.env.APP_ENV = 'example'

    Config.clear()

    await Config.safeLoad(Path.fixtures('config/app.ts'))
    await Config.safeLoad(Path.fixtures('config/database.ts'))

    assert.equal(Config.get('app.env'), 'example')
  }

  @Test()
  public async shouldNotThrowErrorsIfConfigurationPathDoesNotExistInLoad({ assert }: Context) {
    const path = Path.fixtures('not-found.ts')

    assert.isFalse(await File.exists(path))
    assert.isUndefined(await Config.load(path))
  }

  @Test()
  public async shouldNotThrowErrorsIfConfigurationPathDoesNotExistInSafeLoad({ assert }: Context) {
    const path = Path.fixtures('not-found.ts')

    assert.isFalse(await File.exists(path))
    assert.isUndefined(await Config.safeLoad(path))
  }

  @Test()
  public async shouldNotThrowErrorsIfConfigurationPathDoesNotExistInLoadAll({ assert }: Context) {
    const path = Path.fixtures('not-found/path')

    assert.isFalse(await Folder.exists(path))
    assert.isUndefined(await Config.loadAll(path))
  }

  @Test()
  @Cleanup(() => Config.delete('app'))
  public async shouldBeAbleToLoadAllConfigurationPathSafely({ assert }: Context) {
    Config.set('app', {})

    await Config.loadAll(Path.fixtures('config'), true)

    assert.deepEqual(Config.get('app'), {})
  }

  @Test()
  @Cleanup(() => Config.delete('app'))
  public async shouldBeAbleToLoadASingleFileInLoadAllMethod({ assert }: Context) {
    Config.set('app', {})

    await Config.loadAll(Path.fixtures('config/app.ts'), true)

    assert.deepEqual(Config.get('app'), {})
  }

  @Test()
  @Cleanup(() => (process.env.IS_TS = 'true'))
  public async shouldBeAbleToLoadAllJsFilesButNotTsFilesWhenEnvTsIsFalse({ assert }: Context) {
    process.env.IS_TS = 'false'

    Config.clear()

    await Config.loadAll(Path.fixtures('jsconfig'), false)

    assert.equal(Config.get('app.name'), 'AthennaJS')
  }

  @Test()
  public async shouldBeAbleToLoadConfigFoldersRecursively({ assert }: Context) {
    Config.clear()

    await Config.loadAll(Path.fixtures('recursive'), false)

    assert.equal(Config.get('cli.app.type'), 'cli')
    assert.equal(Config.get('http.app.type'), 'http')
  }

  @Test()
  @Cleanup(async () => {
    await Folder.safeRemove(Path.fixtures('recursive-copy'))
  })
  public async shouldBeAbleToRewriteTheConfigFileAndSaveModifications({ assert }: Context) {
    const folder = await new Folder(Path.fixtures('recursive')).copy(Path.fixtures('recursive-copy'), {
      withContent: true
    })

    Config.clear()

    await Config.loadAll(folder.path, false)

    Config.set('http.app.type', 'cli')
    Config.set('cli.app.type', 'http')

    await Config.rewrite('cli.app')
    await Config.rewrite('http.app')

    const files = folder.getFilesByPattern()

    const cliConfig = await files.find(file => file.path.includes(`${sep}cli`)).import()
    const httpConfig = await files.find(file => file.path.includes(`${sep}http`)).import()

    assert.equal(cliConfig.type, 'http')
    assert.equal(httpConfig.type, 'cli')
  }

  @Test()
  @Cleanup(async () => {
    await Folder.safeRemove(Path.fixtures('recursive-copy'))
  })
  public async shouldThrowAnExceptionIfCallingRewriteMethodWithABadKey({ assert }: Context) {
    const folder = await new Folder(Path.fixtures('recursive')).copy(Path.fixtures('recursive-copy'), {
      withContent: true
    })

    Config.clear()

    await Config.loadAll(folder.path, false)

    await assert.rejects(() => Config.rewrite('cli.app.type'), NotSupportedKeyException)
  }

  @Test()
  @Cleanup(async () => {
    await Folder.safeRemove(Path.fixtures('recursive-copy'))
  })
  public async shouldThrowAnExceptionIfCallingRewriteMethodWithANotFoundKey({ assert }: Context) {
    const folder = await new Folder(Path.fixtures('recursive')).copy(Path.fixtures('recursive-copy'), {
      withContent: true
    })

    Config.clear()

    await Config.loadAll(folder.path, false)

    await assert.rejects(() => Config.rewrite('not-found'), NotSupportedKeyException)
  }
}
