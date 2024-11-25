import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Headers, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserVpScoringService } from '../services/user-vp-scoring.service';
import { CreateUserVpScoringDto } from '../dtos/user-vp-scoring-dto/create-user-vp-scoring.dto';
import { UserVpScoring } from '../entities/user-vp-scoring.entity';
import { UpdateUserVpScoringDto } from '../dtos/user-vp-scoring-dto/update-user-vp-scoring.dto';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';

@Controller('user-vp-scoring')
@ApiTags('user-vp-scoring')
export class UserVpScoringController {
  constructor(
    private readonly userVpScoringService: UserVpScoringService,
  ) {}

  @Post()
  async createUserVpScoring(
    @Body() createUserVpScoringDto: CreateUserVpScoringDto,
    @Headers('tenantId') tenantId: string,
  ): Promise<UserVpScoring> {
    return await this.userVpScoringService.createUserVpScoring(
      createUserVpScoringDto,
      tenantId,
    );
  }

  @Get('')
  async findAllUserVpScorings(
    @Headers('tenantId') tenantId: string,
    @Query() paginationOptions?: PaginationDto,
  ) {
    
    return this.userVpScoringService.findAllUserVpScorings(
      tenantId,
      paginationOptions,
    );
  }

  @Get(':id')
  findOneUserVpScoring(@Param('id') id: string) {
    return this.userVpScoringService.findOneUserVpScoring(id);
  }

  @Put(':id')
  updateUserVpScoring(
    @Headers('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() updateUserVpScoringDto: UpdateUserVpScoringDto,
  ) {
    return this.userVpScoringService.updateUserVpScoring(
      id,
      updateUserVpScoringDto,
      tenantId,
    );
  }

  @Delete(':id')
  removeUserVpScoring(@Headers('tenantId') tenantId: string, @Param('id') id: string) {
    return this.userVpScoringService.removeUserVpScoring(id);
  }
}
