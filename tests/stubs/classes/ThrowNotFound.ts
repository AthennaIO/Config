import { Value } from '#src/annotations/Value'

export class ThrowNotFound {
  @Value('app.notFound')
  public app: any
}
