import { Body, Controller, Delete, Post, Query } from '@nestjs/common';
import { ArticleService } from '../services/article-service';

@Controller()
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post('/articles/create')
  async createArticle(@Body() body: any) {
    return this.articleService.createArticle(body);
  }

  @Post('/articles/update')
  async updateArticle(@Body() body: any, @Query('id') id: string) {
    return this.articleService.updateArticle(id, body);
  }

  @Delete('/articles/delete')
  async deleteArticle(@Query('id') id: string) {
    return this.articleService.deleteArticle(id);
  }
}
