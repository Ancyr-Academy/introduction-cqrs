import { Body, Controller, Delete, Post, Query } from '@nestjs/common';
import { ClapsService } from '../services/claps-service';

@Controller()
export class ClapsController {
  constructor(private readonly clapsService: ClapsService) {}

  @Post('/claps/create')
  async createClap(@Body() body: any) {
    return this.clapsService.createClap(body);
  }

  @Post('/claps/update')
  async updateClap(@Body() body: any, @Query('id') id: string) {
    return this.clapsService.updateClap(id, body);
  }

  @Delete('/claps/delete')
  async deleteClap(@Query('id') id: string) {
    return this.clapsService.deleteClap(id);
  }
}
