import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ProfileProjector } from '../projections/profile/profile-projector';
import { UserViewModel } from '../view-models/user-view-model';

export class GetUserQuery implements IQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetUserQuery)
export class GetUserHandler
  implements IQueryHandler<GetUserQuery, UserViewModel>
{
  constructor(private readonly projector: ProfileProjector) {}

  execute(query: GetUserQuery) {
    return this.projector.getProjection(query.id);
  }
}
