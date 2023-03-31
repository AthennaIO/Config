/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { File, Path } from '@athenna/common'
import { EnvHelper } from '#src/Helpers/EnvHelper'
import { Test, BeforeAll, AfterAll, TestContext, BeforeEach, Cleanup } from '@athenna/test'

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
    Object.keys(process.env).forEach(key => delete process.env[key])

    process.env.NODE_ENV = 'test'
  }

  @Test()
  public async shouldNotOverridePreSetEnvironmentVariables({ assert }: TestContext) {
    process.env.PRESET = 'true'
    process.env.NODE_ENV = ''
    EnvHelper.resolveFile()

    process.env.NODE_ENV = 'testing'
    EnvHelper.resolveFile()

    assert.equal(Env('PRESET'), true)
  }

  @Test()
  public async shouldOverridePreSetEnvironmentVariables({ assert }: TestContext) {
    process.env.OVERRIDE_ENV = 'true'
    process.env.PRESET = 'true'
    process.env.NODE_ENV = ''
    EnvHelper.resolveFile()

    process.env.NODE_ENV = 'testing'
    EnvHelper.resolveFile()

    assert.equal(Env('PRESET'), false)
  }

  @Test()
  public async shouldBeAbleToResolveMoreThanOneEnvFilesAtSameTime({ assert }: TestContext) {
    process.env.NODE_ENV = ''
    EnvHelper.resolveFile()

    process.env.NODE_ENV = 'testing'
    EnvHelper.resolveFile()

    assert.equal(Env('ENV'), 'production')
    assert.equal(Env('ENV_TESTING'), 'testing')
  }

  @Test()
  public async shouldBeAbleToParseTheTypeOfTheEnvironmentVariable({ assert }: TestContext) {
    process.env.NODE_ENV = ''
    EnvHelper.resolveFile()

    assert.strictEqual(Env('NUMBER_ENV'), 10)
    assert.strictEqual(Env('NUMBER_ENV', undefined, false), '10')
    assert.strictEqual(Env('BOOLEAN_ENV'), true)
    assert.strictEqual(Env('BOOLEAN_ENV', undefined, false), 'true')
    assert.deepEqual(Env('OBJECT_ENV'), { name: 'Paulo' })
    assert.deepEqual(Env('OBJECT_ENV', undefined, false), `{"name":"Paulo"}`)
  }

  @Test()
  public async shouldBeAbleToFallbackToDefaultValuesWhenTheEnvDoesNotExist({ assert }: TestContext) {
    assert.deepEqual(Env('NO_EXIST', false), false)
  }

  @Test()
  public async shouldBeAbleToSetEnvValuesInsideOfOtherEnvValues({ assert }: TestContext) {
    process.env.NODE_ENV = ''
    EnvHelper.resolveFile()

    assert.equal(Env('ENV_IN_ENV'), '10-true')
    assert.deepEqual(Env('ENV_IN_ENV_JSON'), { maintainers: { name: 'Paulo' } })
    assert.deepEqual(Env('ENV_IN_ENV_JSON', undefined, false), `{ "maintainers": {"name":"Paulo"} }`)
  }

  @Test()
  public async shouldBeAbleToTurnOffTheAutoCastForSpecificsEnvsWhenNeeded({ assert }: TestContext) {
    process.env.NODE_ENV = ''
    EnvHelper.resolveFile()

    assert.equal(Env('NUMBER_ENV', '10', false), '10')
    assert.equal(Env('STRING_NUMBER_ENV', '(10)', false), '(10)')
  }

  @Test()
  public async shouldBeAbleToUseEnvWithoutAnyEnvFile({ assert }: TestContext) {
    process.env.NODE_ENV = 'undefined'

    EnvHelper.resolveFile()

    assert.equal(Env('NODE_ENV'), 'undefined')
    assert.isUndefined(Env('OTHER_DEFINED'))
  }

  @Test()
  public async shouldBeAbleToUseEnvWithoutAnyEnvFileAndOverridingValues({ assert }: TestContext) {
    process.env.NODE_ENV = 'undefined'
    process.env.OVERRIDE_ENV = 'true'

    EnvHelper.resolveFile()

    assert.equal(Env('NODE_ENV'), 'other')
    assert.isUndefined(Env('OTHER_DEFINED'))
  }

  @Test()
  public async shouldBeAbleToResolveAnyEnvFilePathWithoutDependingOnNODE_ENV({ assert }: TestContext) {
    EnvHelper.resolveFilePath(Path.stubs('.env.path'))

    assert.equal(Env('ENV'), 'env.path')
  }

  @Test()
  public async shouldNotThrowErrorsWhenEnvFileDoesNotExist({ assert }: TestContext) {
    assert.isUndefined(EnvHelper.resolveFilePath(Path.stubs('.env.not-found')))
  }

  @Test()
  public async shouldBeAbleToLoadTheEnvFileUsingNodeEnvVariable({ assert }: TestContext) {
    process.env.NODE_ENV = undefined

    EnvHelper.resolveFile(true)

    assert.isUndefined(Env('NUMBER_ENV'))
    assert.equal(Env('NODE_ENV'), 'other')
    assert.equal(Env('OTHER_DEFINED'), true)
  }

  @Test()
  @Cleanup(async () => {
    await new File(Path.stubs('.env')).copy(Path.pwd('.env'))
  })
  public async shouldNotTryToLoadNodeEnvIfFileDoesNotExist({ assert }: TestContext) {
    await File.safeRemove(Path.pwd('.env'))

    process.env.NODE_ENV = undefined

    EnvHelper.resolveFile(true)

    assert.isUndefined(Env('NUMBER_ENV'))
    assert.equal(Env('NODE_ENV'), 'undefined')
    assert.isUndefined(Env('OTHER_DEFINED'))
  }

  @Test()
  @Cleanup(async () => {
    await new File(Path.stubs('.env')).copy(Path.pwd('.env'))
  })
  public async shouldNotTryToLoadNodeEnvIfEnvFileContentDoesNotHaveNODE_ENV({ assert }: TestContext) {
    const file = new File(Path.pwd('.env'))

    await file.setContent(file.getContentAsStringSync().replace('NODE_ENV="other"', ''))

    process.env.NODE_ENV = undefined
    process.env.OVERRIDE_ENV = '(true)'

    EnvHelper.resolveFile(true)

    assert.isDefined(Env('NUMBER_ENV'))
    assert.isUndefined(Env('OTHER_DEFINED'))
    assert.equal(Env('NODE_ENV'), 'undefined')
  }

  @Test()
  @Cleanup(async () => {
    await new File(Path.stubs('.env')).copy(Path.pwd('.env'))
  })
  public async shouldNotLoadNodeEnvIfTheValueOfEnvFileIsNotValid({ assert }: TestContext) {
    const file = new File(Path.pwd('.env'))

    await file.setContent(file.getContentAsStringSync().replace('NODE_ENV="other"', 'NODE_ENV="undefined"'))

    process.env.NODE_ENV = undefined
    process.env.OVERRIDE_ENV = '(true)'

    EnvHelper.resolveFile(true)

    assert.isDefined(Env('NUMBER_ENV'))
    assert.isUndefined(Env('OTHER_DEFINED'))
    assert.equal(Env('NODE_ENV'), 'undefined')
  }
}
