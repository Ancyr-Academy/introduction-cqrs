import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/sqlite';
import { UserViewModel } from '../view-models/user-view-model';
import { UserProfileView } from '../../domain/views/user-profile-view';

@Injectable()
export class UserProfileProjector {
  constructor(private readonly entityManager: EntityManager) {}

  async getProjection(userId: string): Promise<UserViewModel> {
    let entry = await this.entityManager.findOne(UserProfileView, {
      id: userId,
    });

    if (!entry) {
      await this.synchronize(userId);

      entry = await this.entityManager.findOneOrFail(UserProfileView, {
        id: userId,
      });
    }

    return entry.content;
  }

  async synchronize(userId: string) {
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
      [userId],
    );

    const user = result[0];
    const viewModel: UserViewModel = {
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

    await this.entityManager.upsert(UserProfileView, {
      id: user.userId,
      content: viewModel,
    });

    await this.entityManager.flush();
  }
}
