import { Value } from '#src/Decorators/Value'

export class DoesNotThrowNotFound {
  @Value('app.notFound', null)
  public defined: any

  @Value('app.notFoundApp', 'Athenna')
  public definedApp: any
}
