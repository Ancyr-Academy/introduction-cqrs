import { Entity, Property } from '@mikro-orm/core';
import { UserViewModel } from '../../application/view-models/user-view-model';

@Entity()
export class UserProfileView {
  @Property({ primary: true })
  public id: string;

  @Property({ type: 'jsonb' })
  public content: UserViewModel;
}
