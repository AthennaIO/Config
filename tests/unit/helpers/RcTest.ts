/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Rc } from '#src'
import { AfterEach, Test } from '@athenna/test'
import type { Context } from '@athenna/test/types'
import { File, Folder, Path } from '@athenna/common'

export default class RcTest {
  private originalRcContent = new File(Path.stubs('.athennarc.json')).getContentAsStringSync()
  private originalPJsonContent = new File(Path.pwd('package.json')).getContentAsStringSync()
  private originalRcModuleContent = new File(Path.stubs('rc.ts')).getContentAsStringSync()

  @AfterEach()
  public async afterEach() {
    await Folder.safeRemove(Path.stubs('tmp'))
    await new File(Path.pwd('package.json')).setContent(this.originalPJsonContent)
    await new File(Path.stubs('.athennarc.json')).setContent(this.originalRcContent)
    await new File(Path.stubs('rc.ts')).setContent(this.originalRcModuleContent)
  }

  @Test()
  public async shouldBeAbleToSetTheRcFileThatRcHelperShouldUse({ assert }: Context) {
    const path = Path.stubs('.athennarc.json')

    await Rc.setFile(path)

    assert.deepEqual(await Rc.file.getContentAsJson(), await new File(path).getContentAsJson())
  }

  @Test()
  public async shouldBeAbleToSetSomeKeyValueToAnRcKey({ assert }: Context) {
    const path = Path.stubs('.athennarc.json')

    await Rc.setFile(path)

    await Rc.setTo('commands', 'one', 'value')
      .setTo('commands', 'two', 'value')
      .setTo('commands', 'three', 'value')
      .setTo('commands', 'test', 'value')
      .save()

    const content = await new File(path).getContentAsJson()

    assert.containsSubset(content, {
      commands: {
        one: 'value',
        two: 'value',
        test: 'value',
        three: 'value',
      },
    })

    const oldContentJson = JSON.parse(this.originalRcContent)

    oldContentJson.commands = content.commands

    assert.deepEqual(content, oldContentJson)
  }

  @Test()
  public async shouldBeAbleToChangeTheEntireValueOfSomeProperty({ assert }: Context) {
    const path = Path.stubs('.athennarc.json')

    await Rc.setFile(path)

    await Rc.setTo('commands', {
      one: 'value',
      two: 'value',
      test: 'value',
      three: 'value',
    }).save()

    const content = await new File(path).getContentAsJson()

    assert.deepEqual(content.commands, {
      one: 'value',
      two: 'value',
      test: 'value',
      three: 'value',
    })

    const oldContentJson = JSON.parse(this.originalRcContent)

    oldContentJson.commands = content.commands

    assert.deepEqual(content, oldContentJson)
  }

  @Test()
  public async shouldBeAbleToPushSomeValueToAnRcArrayKey({ assert }: Context) {
    const path = Path.stubs('.athennarc.json')

    await Rc.setFile(path)

    await Rc.pushTo('providers', 'value').pushTo('providers', 'value').pushTo('providers', 'value').save()

    const content = await new File(path).getContentAsJson()

    assert.containsSubset(content, {
      providers: ['value', 'value', 'value'],
    })

    const oldContentJson = JSON.parse(this.originalRcContent)

    oldContentJson.providers = content.providers

    assert.deepEqual(content, oldContentJson)
  }

  @Test()
  public async shouldBeAbleToSetSomeKeyValueToAnRcKeyUsingAPackageJsonFile({ assert }: Context) {
    const path = Path.pwd('package.json')

    await Rc.setFile(path)

    await Rc.setTo('commands', 'one', 'value')
      .setTo('commands', 'two', 'value')
      .setTo('commands', 'three', 'value')
      .setTo('commands', 'test', 'value')
      .save()

    const content = await new File(path).getContentAsJson()

    assert.containsSubset(content.athenna, {
      commands: {
        one: 'value',
        two: 'value',
        test: 'value',
        three: 'value',
      },
    })

    const oldContentJson = JSON.parse(this.originalPJsonContent)

    oldContentJson.athenna.commands = content.athenna.commands

    assert.deepEqual(content, oldContentJson)
  }

  @Test()
  public async shouldBeAbleToChangeTheEntireValueOfSomePropertyUsingAPackageJsonFile({ assert }: Context) {
    const path = Path.pwd('package.json')

    await Rc.setFile(path)

    await Rc.setTo('commands', {
      one: 'value',
      two: 'value',
      test: 'value',
      three: 'value',
    }).save()

    const content = await new File(path).getContentAsJson()

    assert.deepEqual(content.athenna.commands, {
      one: 'value',
      two: 'value',
      test: 'value',
      three: 'value',
    })

    const oldContentJson = JSON.parse(this.originalPJsonContent)

    oldContentJson.athenna.commands = content.athenna.commands

    assert.deepEqual(content, oldContentJson)
  }

  @Test()
  public async shouldBeAbleToPushSomeValueToAnRcArrayKeyUsingAPackageJsonFile({ assert }: Context) {
    const path = Path.pwd('package.json')

    await Rc.setFile(path)

    await Rc.pushTo('providers', 'value').pushTo('providers', 'value').pushTo('providers', 'value').save()

    const content = await new File(path).getContentAsJson()

    assert.containsSubset(content.athenna, {
      providers: ['value', 'value', 'value'],
    })

    const oldContentJson = JSON.parse(this.originalPJsonContent)

    oldContentJson.athenna.providers = content.athenna.providers

    assert.deepEqual(content, oldContentJson)
  }

  @Test()
  public async shouldBeAbleToSetSomeKeyValueToAnRcKeyUsingAModuleFile({ assert }: Context) {
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
  public async shouldBeAbleToChangeTheEntireValueOfSomePropertyUsingAModuleFile({ assert }: Context) {
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
  public async shouldBeAbleToPushSomeValueToAnRcArrayKeyUsingAModuleFile({ assert }: Context) {
    const path = Path.stubs('rc.ts')

    await Rc.setFile(path)

    await Rc.pushTo('providers', 'value').pushTo('providers', 'value').pushTo('providers', 'value').save()

    assert.containsSubset(await new File(path).import(), {
      providers: ['value', 'value', 'value'],
    })
  }
}
