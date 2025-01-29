import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { uuidv7 } from 'uuidv7';
import { EntityManager } from '@mikro-orm/sqlite';
import { User } from '../../domain/entity/user';
import { UserViewModel } from '../view-models/user-view-model';
import { UserProfileProjector } from './user-profile-projector.service';

const userSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
});

@Injectable()
export class UserService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly projector: UserProfileProjector,
  ) {}

  async createUser(body: z.infer<typeof userSchema>) {
    const data = userSchema.parse(body);

    const user = this.entityManager.create(User, {
      id: uuidv7(),
      firstName: data.firstName,
      lastName: data.lastName,
    });

    await this.entityManager.flush();

    return {
      id: user.id,
    };
  }

  async updateUser(id: string, body: z.infer<typeof userSchema>) {
    const data = userSchema.parse(body);

    const user = await this.entityManager.findOneOrFail(User, {
      id,
    });

    user.firstName = data.firstName;
    user.lastName = data.lastName;

    await this.entityManager.flush();
    await this.projector.synchronize(user.id);
  }

  async getUser(id: string): Promise<UserViewModel> {
    return this.projector.getProjection(id);
  }
}
