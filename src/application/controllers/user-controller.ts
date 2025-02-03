import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppCommandBus } from '../../infrastructure/app-command-bus';
import { QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../commands/create-user';
import { GetUserQuery } from '../queries/get-user';
import { UpdateUserCommand } from '../commands/update-user';

@Controller()
export class UserController {
  constructor(
    private readonly commandBus: AppCommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('/users/create')
  async createUser(@Body() body: any) {
    return this.commandBus.execute(new CreateUserCommand(body));
  }

  @Post('/users/update')
  async updateUser(@Body() body: any, @Query('id') id: string) {
    return this.commandBus.execute(
      new UpdateUserCommand({
        id,
        ...body,
      }),
    );
  }

  @Get('/users/get-user')
  async getUser(@Query('id') id: string) {
    return this.queryBus.execute(new GetUserQuery(id));
  }
}
