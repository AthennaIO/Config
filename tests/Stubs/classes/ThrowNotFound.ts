import { Value } from '#src/Decorators/Value'

export class ThrowNotFound {
  @Value('app.notFound')
  public app: any
}
