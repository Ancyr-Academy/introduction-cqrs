import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from '../services/user-service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/users/create')
  async createUser(@Body() body: any) {
    return this.userService.createUser(body);
  }

  @Post('/users/update')
  async updateUser(@Body() body: any, @Query('id') id: string) {
    return this.userService.updateUser(id, body);
  }

  @Get('/users/get-user')
  async getUser(@Query('id') id: string) {
    return this.userService.getUser(id);
  }
}
