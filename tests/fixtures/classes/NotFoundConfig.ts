import { Value } from '#src/annotations/Value'

export class NotFoundConfig {
  @Value('app.notFound', 'Athenna')
  public defined: any

  @Value('app.notFound')
  public undefined: any
}
