/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { File, Path } from '@athenna/common'
import { EnvHelper } from '#src/helpers/EnvHelper'
import { Test, BeforeAll, AfterAll, BeforeEach, Cleanup, AfterEach, type Context } from '@athenna/test'

export default class EnvTest {
  @BeforeAll()
  public async beforeAll() {
    await new File(Path.stubs('.env')).copy(Path.pwd('.env'))
    await new File(Path.stubs('.env.other')).copy(Path.pwd('.env.other'))
    await new File(Path.stubs('.env.testing')).copy(Path.pwd('.env.testing'))
  }

  @AfterAll()
  public async afterAll() {
    await File.safeRemove(Path.pwd('.env'))
    await File.safeRemove(Path.pwd('.env.other'))
    await File.safeRemove(Path.pwd('.env.testing'))
  }

  @BeforeEach()
  public async beforeEach() {
    process.env = {}
    process.env.APP_ENV = 'test'
  }

  @AfterEach()
  public async afterEach() {
    process.env = {}
  }

  @Test()
  public async shouldNotOverridePreSetEnvironmentVariables({ assert }: Context) {
    process.env.PRESET = 'true'
    process.env.APP_ENV = ''
    EnvHelper.resolveFile()

    process.env.APP_ENV = 'testing'
    EnvHelper.resolveFile()

    assert.equal(Env('PRESET'), true)
  }

  @Test()
  public async shouldOverridePreSetEnvironmentVariables({ assert }: Context) {
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
  public async shouldBeAbleToParseTheTypeOfTheEnvironmentVariable({ assert }: Context) {
    process.env.APP_ENV = ''
    EnvHelper.resolveFile()

    assert.strictEqual(Env('NUMBER_ENV'), 10)
    assert.strictEqual(Env('NUMBER_ENV', undefined, false), '10')
    assert.strictEqual(Env('BOOLEAN_ENV'), true)
    assert.strictEqual(Env('BOOLEAN_ENV', undefined, false), 'true')
    assert.deepEqual(Env('OBJECT_ENV'), { name: 'Paulo' })
    assert.deepEqual(Env('OBJECT_ENV', undefined, false), `{"name":"Paulo"}`)
  }

  @Test()
  public async shouldBeAbleToFallbackToDefaultValuesWhenTheEnvDoesNotExist({ assert }: Context) {
    assert.deepEqual(Env('NO_EXIST', false), false)
  }

  @Test()
  public async shouldBeAbleToSetEnvValuesInsideOfOtherEnvValues({ assert }: Context) {
    process.env.APP_ENV = ''
    EnvHelper.resolveFile()

    assert.equal(Env('ENV_IN_ENV'), '10-true')
    assert.deepEqual(Env('ENV_IN_ENV_JSON'), { maintainers: { name: 'Paulo' } })
    assert.deepEqual(Env('ENV_IN_ENV_JSON', undefined, false), `{ "maintainers": {"name":"Paulo"} }`)
  }

  @Test()
  public async shouldBeAbleToTurnOffTheAutoCastForSpecificsEnvsWhenNeeded({ assert }: Context) {
    process.env.APP_ENV = ''
    EnvHelper.resolveFile()

    assert.equal(Env('NUMBER_ENV', '10', false), '10')
    assert.equal(Env('STRING_NUMBER_ENV', '(10)', false), '(10)')
  }

  @Test()
  public async shouldBeAbleToUseEnvWithoutAnyEnvFile({ assert }: Context) {
    process.env.APP_ENV = 'undefined'

    EnvHelper.resolveFile()

    assert.equal(Env('APP_ENV'), 'undefined')
    assert.isUndefined(Env('OTHER_DEFINED'))
  }

  @Test()
  public async shouldBeAbleToUseEnvWithoutAnyEnvFileAndOverridingValues({ assert }: Context) {
    process.env.APP_ENV = 'undefined'
    process.env.OVERRIDE_ENV = 'true'

    EnvHelper.resolveFile()

    assert.equal(Env('APP_ENV'), 'other')
    assert.isUndefined(Env('OTHER_DEFINED'))
  }

  @Test()
  public async shouldBeAbleToResolveAnyEnvFilePathWithoutDependingOnAPP_ENV({ assert }: Context) {
    EnvHelper.resolveFilePath(Path.stubs('.env.path'))

    assert.equal(Env('ENV'), 'env.path')
  }

  @Test()
  public async shouldNotThrowErrorsWhenEnvFileDoesNotExist({ assert }: Context) {
    assert.isUndefined(EnvHelper.resolveFilePath(Path.stubs('.env.not-found')))
  }

  @Test()
  public async shouldBeAbleToLoadTheEnvFileUsingNodeEnvVariable({ assert }: Context) {
    process.env.APP_ENV = undefined

    EnvHelper.resolveFile(true)

    assert.isUndefined(Env('NUMBER_ENV'))
    assert.equal(Env('APP_ENV'), 'other')
    assert.equal(Env('OTHER_DEFINED'), true)
  }

  @Test()
  @Cleanup(async () => {
    await new File(Path.stubs('.env')).copy(Path.pwd('.env'))
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
    await new File(Path.stubs('.env')).copy(Path.pwd('.env'))
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
    await new File(Path.stubs('.env')).copy(Path.pwd('.env'))
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
