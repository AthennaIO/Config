import { Value } from '#src/decorators/Value'

export class ThrowNotFound {
  @Value('app.notFound')
  public app: any
}
