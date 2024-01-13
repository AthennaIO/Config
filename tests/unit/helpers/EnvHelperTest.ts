/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { File, Json, Path } from '@athenna/common'
import { EnvHelper } from '#src/helpers/EnvHelper'
import { Test, BeforeAll, AfterAll, Cleanup, AfterEach, type Context } from '@athenna/test'

export default class EnvHelperTest {
  public env: any = Json.copy(process.env)
  public argv: string[] = Json.copy(process.argv)

  @BeforeAll()
  public async beforeAll() {
    await new File(Path.fixtures('.env')).copy(Path.pwd('.env'))
    await new File(Path.fixtures('.env.other')).copy(Path.pwd('.env.other'))
    await new File(Path.fixtures('.env.testing')).copy(Path.pwd('.env.testing'))
  }

  @AfterAll()
  public async afterAll() {
    await File.safeRemove(Path.pwd('.env'))
    await File.safeRemove(Path.pwd('.env.other'))
    await File.safeRemove(Path.pwd('.env.testing'))
  }

  @AfterEach()
  public async afterEach() {
    process.env = Json.copy(this.env)
    process.argv = Json.copy(this.argv)
  }

  @Test()
  public async shouldBeAbleToResolveDefaultDotEnvFile({ assert }: Context) {
    process.env.APP_ENV = ''
    process.env.NODE_ENV = ''

    EnvHelper.resolveFile()

    assert.deepEqual(Env('ENV'), 'production')
  }

  @Test()
  public async shouldBeAbleToResolveDotEnvFileByAppEnvVariable({ assert }: Context) {
    process.env.APP_ENV = 'testing'
    process.env.NODE_ENV = ''

    EnvHelper.resolveFile()

    assert.equal(Env('ENV_TESTING'), 'testing')
  }

  @Test()
  public async shouldBeAbleToResolveDotEnvFileByNodeEnvVariable({ assert }: Context) {
    process.env.APP_ENV = ''
    process.env.NODE_ENV = 'testing'

    EnvHelper.resolveFile()

    assert.equal(Env('ENV_TESTING'), 'testing')
  }

  @Test()
  public async shouldBeAbleToResolveDotEnvFileByEnvCliFlagVariable({ assert }: Context) {
    process.env.APP_ENV = ''
    process.env.NODE_ENV = ''

    process.argv.push('--env', 'testing')

    EnvHelper.resolveFile()

    assert.equal(Env('ENV_TESTING'), 'testing')
  }

  @Test()
  public async shouldBeAbleToResolveMoreThanOneDotEnvFile({ assert }: Context) {
    process.env.APP_ENV = ''
    EnvHelper.resolveFile()

    process.env.APP_ENV = 'testing'
    EnvHelper.resolveFile()

    assert.equal(Env('ENV'), 'production')
    assert.equal(Env('ENV_TESTING'), 'testing')
  }

  @Test()
  public async shouldBeAbleToOverrideEnvVarsThatAreAlreadyDefined({ assert }: Context) {
    process.env.PRESET = 'true'
    process.env.APP_ENV = ''
    EnvHelper.resolveFile()

    process.env.APP_ENV = 'testing'
    EnvHelper.resolveFile()

    assert.equal(Env('PRESET'), true)
  }

  @Test()
  public async shouldBeAbleToOverrideEnvVarsThatAreAlreadyDefinedWithOverrideEnvAsTrue({ assert }: Context) {
    process.env.OVERRIDE_ENV = 'true'

    process.env.PRESET = 'true'
    process.env.APP_ENV = ''
    EnvHelper.resolveFile()

    process.env.APP_ENV = 'testing'
    EnvHelper.resolveFile()

    assert.equal(Env('PRESET'), false)
  }

  @Test()
  public async shouldBeAbleToResolveMoreThanOneEnvFilesAtSameTime({ assert }: Context) {
    process.env.APP_ENV = ''
    EnvHelper.resolveFile()

    process.env.APP_ENV = 'testing'
    EnvHelper.resolveFile()

    assert.equal(Env('ENV'), 'production')
    assert.equal(Env('ENV_TESTING'), 'testing')
  }

  @Test()
  public async shouldBeAbleToLookupTheAppEnvValueInDotEnvFileWhenAppEnvNodeEnvAndEnvArgIsNotDefined({
    assert
  }: Context) {
    process.env.APP_ENV = ''
    process.env.NODE_ENV = ''

    EnvHelper.resolveFile(true)

    assert.equal(Env('OTHER_DEFINED'), true)
  }

  @Test()
  public async shouldBeAbleToResolveAnyEnvFilePathWithoutDependingOnAppEnv({ assert }: Context) {
    EnvHelper.resolveFilePath(Path.fixtures('.env.path'))

    assert.equal(Env('ENV'), 'env.path')
  }

  @Test()
  public async shouldNotThrowErrorsWhenEnvFileDoesNotExist({ assert }: Context) {
    assert.isUndefined(EnvHelper.resolveFilePath(Path.fixtures('.env.not-found')))
  }

  @Test()
  @Cleanup(async () => {
    await new File(Path.fixtures('.env')).copy(Path.pwd('.env'))
  })
  public async shouldNotTryToLoadNodeEnvIfFileDoesNotExist({ assert }: Context) {
    await File.safeRemove(Path.pwd('.env'))

    process.env.APP_ENV = undefined
    process.env.NODE_ENV = undefined

    EnvHelper.resolveFile(true)

    assert.isUndefined(Env('APP_ENV'))
    assert.isUndefined(Env('NUMBER_ENV'))
    assert.isUndefined(Env('OTHER_DEFINED'))
  }

  @Test()
  @Cleanup(async () => {
    await new File(Path.fixtures('.env')).copy(Path.pwd('.env'))
  })
  public async shouldNotTryToLoadNodeEnvIfEnvFileContentDoesNotHaveAPP_ENV({ assert }: Context) {
    const file = new File(Path.pwd('.env'))

    await file.setContent(file.getContentAsStringSync().replace('APP_ENV="other"', ''))

    process.env.APP_ENV = undefined
    process.env.NODE_ENV = undefined
    process.env.OVERRIDE_ENV = 'true'

    EnvHelper.resolveFile(true)

    assert.isUndefined(Env('APP_ENV'))
    assert.isDefined(Env('NUMBER_ENV'))
    assert.isUndefined(Env('OTHER_DEFINED'))
  }

  @Test()
  @Cleanup(async () => {
    await new File(Path.fixtures('.env')).copy(Path.pwd('.env'))
  })
  public async shouldNotLoadNodeEnvIfTheValueOfEnvFileIsNotValid({ assert }: Context) {
    const file = new File(Path.pwd('.env'))

    await file.setContent(file.getContentAsStringSync().replace('APP_ENV="other"', 'APP_ENV="undefined"'))

    process.env.APP_ENV = undefined
    process.env.OVERRIDE_ENV = '(true)'

    EnvHelper.resolveFile(true)

    assert.isDefined(Env('NUMBER_ENV'))
    assert.isUndefined(Env('OTHER_DEFINED'))
    assert.equal(Env('APP_ENV'), 'undefined')
  }
}
