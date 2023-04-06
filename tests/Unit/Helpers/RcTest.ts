/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Rc, Config } from '#src'
import { File, Folder, Path } from '@athenna/common'
import { AfterEach, BeforeEach, Test, TestContext } from '@athenna/test'

export default class RcTest {
  private originalRcContent = new File(Path.stubs('.athennarc.json')).getContentAsJsonSync()
  private originalRcModuleContent = new File(Path.stubs('rc.ts')).getContentAsStringSync()

  @BeforeEach()
  public async beforeEach() {
    Config.set('rc.isInPackageJson', true)

    await Rc.setFile(Path.pwd('.athennarc.json'), true)
  }

  @AfterEach()
  public async afterEach() {
    await Folder.safeRemove(Path.stubs('tmp'))
    await new File(Path.stubs('.athennarc.json')).setContent(
      JSON.stringify(this.originalRcContent, null, 2).concat('\n'),
    )
    await new File(Path.stubs('rc.ts')).setContent(this.originalRcModuleContent)
  }

  @Test()
  public async shouldBeAbleToSetTheRcFileThatRcHelperShouldUse({ assert }: TestContext) {
    Config.set('rc.isInPackageJson', false)
    const path = Path.stubs('.athennarc.json')

    await Rc.setFile(path)

    assert.deepEqual(await Rc.file.getContentAsJson(), await new File(path).getContentAsJson())
  }

  @Test()
  public async shouldBeAbleToSetSomeKeyValueToAnRcKey({ assert }: TestContext) {
    Config.set('rc.isInPackageJson', false)
    const path = Path.stubs('.athennarc.json')

    await Rc.setFile(path)

    await Rc.setTo('commands', 'one', 'value')
      .setTo('commands', 'two', 'value')
      .setTo('commands', 'three', 'value')
      .setTo('commands', 'test', 'value')
      .save()

    assert.containsSubset(await new File(path).getContentAsJson(), {
      commands: {
        one: 'value',
        two: 'value',
        test: 'value',
        three: 'value',
      },
    })
  }

  @Test()
  public async shouldBeAbleToChangeTheEntireValueOfSomeProperty({ assert }: TestContext) {
    Config.set('rc.isInPackageJson', false)
    const path = Path.stubs('.athennarc.json')

    await Rc.setFile(path)

    await Rc.setTo('commands', {
      one: 'value',
      two: 'value',
      test: 'value',
      three: 'value',
    }).save()

    assert.deepEqual((await new File(path).getContentAsJson()).commands, {
      one: 'value',
      two: 'value',
      test: 'value',
      three: 'value',
    })
  }

  @Test()
  public async shouldBeAbleToPushSomeValueToAnRcArrayKey({ assert }: TestContext) {
    Config.set('rc.isInPackageJson', false)
    const path = Path.stubs('.athennarc.json')

    await Rc.setFile(path)

    await Rc.pushTo('providers', 'value').pushTo('providers', 'value').pushTo('providers', 'value').save()

    assert.containsSubset(await new File(path).getContentAsJson(), {
      providers: ['value', 'value', 'value'],
    })
  }

  @Test()
  public async shouldBeAbleToSetSomeKeyValueToAnRcKeyUsingAModuleFile({ assert }: TestContext) {
    Config.set('rc.isInPackageJson', false)
    const path = Path.stubs('rc.ts')

    await Rc.setFile(path)

    await Rc.setTo('commands', 'one', 'value')
      .setTo('commands', 'two', 'value')
      .setTo('commands', 'three', 'value')
      .setTo('commands', 'test', 'value')
      .save()

    assert.containsSubset(await new File(path).import(), {
      commands: {
        one: 'value',
        two: 'value',
        test: 'value',
        three: 'value',
      },
    })
  }

  @Test()
  public async shouldBeAbleToChangeTheEntireValueOfSomePropertyUsingAModuleFile({ assert }: TestContext) {
    Config.set('rc.isInPackageJson', false)
    const path = Path.stubs('rc.ts')

    await Rc.setFile(path)

    await Rc.setTo('commands', {
      one: 'value',
      two: 'value',
      test: 'value',
      three: 'value',
    }).save()

    assert.deepEqual((await new File(path).import()).commands, {
      one: 'value',
      two: 'value',
      test: 'value',
      three: 'value',
    })
  }

  @Test()
  public async shouldBeAbleToPushSomeValueToAnRcArrayKeyUsingAModuleFile({ assert }: TestContext) {
    Config.set('rc.isInPackageJson', false)
    const path = Path.stubs('rc.ts')

    await Rc.setFile(path)

    await Rc.pushTo('providers', 'value').pushTo('providers', 'value').pushTo('providers', 'value').save()

    assert.containsSubset(await new File(path).import(), {
      providers: ['value', 'value', 'value'],
    })
  }
}
