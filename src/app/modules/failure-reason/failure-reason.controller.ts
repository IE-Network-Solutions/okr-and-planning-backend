import { Body, Controller, Delete, Get, Headers, Injectable, Param, Post, Put, Req } from '@nestjs/common';
import { FailureReasonService } from './failure-reason.service';
import { CreateFailureReasonDto } from './dto/create-failure-reason.dto';
import { UpdateFailureReasonDto } from './dto/update-failure-reason.dto';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { FailureReason } from './entities/failure-reason.entity';

@Controller('failure-reason')
@ApiTags('failure-reason')
export class FailureReasonController {
  constructor(private readonly failureReasonService: FailureReasonService) {}

            // Create a new failure reason
            @Post()
            create(
              @Body() createFailureReasonDto: CreateFailureReasonDto,
              @Headers('tenantId') tenantId: string,  // Get tenantId from headers
            ): Promise<FailureReason> {
              return this.failureReasonService.createFailureReason(createFailureReasonDto, tenantId);
            }
        @Get()
        get(
          @Headers('tenantId') tenantId: string, 
        ) : Promise<any> {
          return this.failureReasonService.getAllFailureReasons(
            tenantId,
          );
        }
        @Delete(':id')
        async delete(
          @Param('id') failureReasonId: string,  // Extract the failureReasonId from the route
          @Headers('tenantId') tenantId: string, 
        ): Promise<void> {
          return this.failureReasonService.deleteFailureReason(failureReasonId, tenantId);
        }
          // PUT endpoint to update a failure reason by ID
        @Put(':id')
        async update(
            @Headers('tenantId') tenantId: string, 
            @Param('id') failureReasonId: string,  // Get failureReasonId from the URL
            @Body() updateFailureReasonDto: UpdateFailureReasonDto,  // Get the updated data from the request body
            ): Promise<void> {
                return this.failureReasonService.updateFailureReason(failureReasonId, updateFailureReasonDto, tenantId);
            }
    
    }
