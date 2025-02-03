import { Body, Controller, Delete, Post, Query } from '@nestjs/common';
import { AppCommandBus } from '../../infrastructure/app-command-bus';
import { CreateArticleCommand } from '../commands/create-article';
import { UpdateArticleCommand } from '../commands/update-article';
import { DeleteArticleCommand } from '../commands/delete-article';

@Controller()
export class ArticleController {
  constructor(private readonly commandBus: AppCommandBus) {}

  @Post('/articles/create')
  async createArticle(@Body() body: any) {
    return this.commandBus.execute(new CreateArticleCommand(body));
  }

  @Post('/articles/update')
  async updateArticle(@Body() body: any, @Query('id') id: string) {
    return this.commandBus.execute(
      new UpdateArticleCommand({
        id,
        ...body,
      }),
    );
  }

  @Delete('/articles/delete')
  async deleteArticle(@Query('id') id: string) {
    return this.commandBus.execute(new DeleteArticleCommand(id));
  }
}
