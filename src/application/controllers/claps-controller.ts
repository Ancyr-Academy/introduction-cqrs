import { Body, Controller, Delete, Post, Query } from '@nestjs/common';
import { AppCommandBus } from '../../infrastructure/app-command-bus';
import { CreateClapCommand } from '../commands/create-clap';
import { DeleteClapCommand } from '../commands/delete-clap';
import { UpdateClapCommand } from '../commands/update-clap';

@Controller()
export class ClapsController {
  constructor(private readonly commandBus: AppCommandBus) {}

  @Post('/claps/create')
  async createClap(@Body() body: any) {
    return this.commandBus.execute(new CreateClapCommand(body));
  }

  @Post('/claps/update')
  async updateClap(@Body() body: any, @Query('id') id: string) {
    return this.commandBus.execute(
      new UpdateClapCommand({
        id,
        ...body,
      }),
    );
  }

  @Delete('/claps/delete')
  async deleteClap(@Query('id') id: string) {
    return this.commandBus.execute(new DeleteClapCommand(id));
  }
}
