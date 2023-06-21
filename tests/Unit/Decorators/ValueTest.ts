/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { File, Folder, Path } from '@athenna/common'
import { Test, Context, BeforeEach, AfterEach } from '@athenna/test'
import { NotFoundConfigException } from '#src/exceptions/NotFoundConfigException'

export default class ValueTest {
  @BeforeEach()
  public async beforeEach() {
    await new Folder(Path.stubs('config')).copy(Path.config())
    await new File(Path.config('recursiveOne.ts')).remove()
    await new File(Path.config('recursiveTwo.ts')).remove()
    await new File(Path.config('notNormalized.ts')).remove()

    await Config.loadAll()
  }

  @AfterEach()
  public async afterEach() {
    Config.clear()
    await Folder.safeRemove(Path.config())
  }

  @Test()
  public async shouldBeAbleToSetConfigurationValuesUsingValueDecorator({ assert }: Context) {
    const { AppService } = await import('#tests/stubs/classes/AppService')

    console.log('hey')
    const appService = new AppService()

    console.log(appService)

    assert.equal(appService.name, 'Athenna')
    assert.deepEqual(appService.app, { name: 'Athenna', env: 'example', environments: ['default'] })
  }

  @Test()
  public async shouldThrowAnExceptionIfTryingToLoadAConfigurationValueThatDoesNotExist({ assert }: Context) {
    await assert.rejects(() => import('#tests/stubs/classes/ThrowNotFound'), NotFoundConfigException)
  }

  @Test()
  public async shouldNotThrowExceptionIfDefaultValueIsSetWhenTryingToLoadAUndefinedConfiguration({ assert }: Context) {
    const { DoesNotThrowNotFound } = await import('#tests/stubs/classes/DoesNotThrowNotFound')

    const doesNotThrowNotFound = new DoesNotThrowNotFound()

    assert.equal(doesNotThrowNotFound.defined, null)
    assert.equal(doesNotThrowNotFound.definedApp, 'Athenna')
  }

  @Test()
  public async shouldBeAbleToSetDifferentValuesToConfigurationsWithoutChangingTheOnesAlreadySetInClass({
    assert,
  }: Context) {
    const { AppService } = await import('#tests/stubs/classes/AppService')

    const appService = new AppService()

    Config.set('app.name', 'Athenna Framework')

    assert.equal(appService.name, 'Athenna')
    assert.deepEqual(appService.app, { name: 'Athenna', env: 'example', environments: ['default'] })
  }
}
