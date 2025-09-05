import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CreateFeedbackRecordDto {
  issuerId: string;
  recipientId: string;
  feedbackTypeId: string;
  feedbackId: string;
  monthId: string;
  reason?: string;
  action?: string;
  points: number;
  carbonCopy?: string[];
  cc?: string[];
  tenantId: string;
}

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);
  private readonly cfrUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.cfrUrl = this.configService.get<string>('externalUrls.cfrUrl');
  }

  /**
   * Create feedback record
   */
  async createFeedback(feedbackData: CreateFeedbackRecordDto): Promise<void> {
    try {
      this.logger.debug(`Creating feedback record for recipient: ${feedbackData.recipientId}, type: ${feedbackData.feedbackTypeId}`);

      const response = await this.httpService
        .post(`${this.cfrUrl}/feedback-record`, feedbackData, {
          headers: {
            'Content-Type': 'application/json',
            'tenantId': feedbackData.tenantId,
          },
        })
        .toPromise();

      this.logger.debug(`Feedback record created successfully for recipient: ${feedbackData.recipientId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error creating feedback record: ${error.message}`);
      if (error.response) {
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
      throw new BadRequestException(`Failed to create feedback record: ${error.message}`);
    }
  }
} 