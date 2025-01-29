import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { uuidv7 } from 'uuidv7';
import { EntityManager } from '@mikro-orm/sqlite';
import { User } from '../../domain/user';
import { UserViewModel } from '../view-models/user-view-model';

const userSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
});

@Injectable()
export class UserService {
  constructor(private readonly entityManager: EntityManager) {}

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
  }

  async getUser(id: string): Promise<UserViewModel> {
    const result: Array<{
      userId: string;
      userFirstName: string;
      userLastName: string;
      articleId: string;
      articleTitle: string;
      articleContent: string;
      totalClaps: number;
    }> = await this.entityManager.execute(
      `
      SELECT 
          u.id as userId, 
          u.first_name as userFirstName, 
          u.last_name as userLastName,
          a.id as articleId,
          a.title as articleTitle,
          a.content as articleContent,
          COALESCE(SUM(c.count), 0) AS totalClaps
      FROM "user" AS u
      LEFT JOIN article AS a 
      ON a.user_id = u.id
      LEFT JOIN clap AS c
      ON c.article_id = a.id
      WHERE u.id = ?
      GROUP BY
          a.id, a.title, a.content;
    `,
      [id],
    );

    const user = result[0];
    return {
      id: user.userId,
      firstName: user.userFirstName,
      lastName: user.userLastName,
      articles: result.map((result) => ({
        id: result.articleId,
        title: result.articleTitle,
        content: result.articleContent,
        clapsCount: result.totalClaps,
      })),
    };
  }
}
