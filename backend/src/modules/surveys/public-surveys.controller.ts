import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SurveysService } from './surveys.service';
import { CreateSurveyResponseDto } from './dto/create-survey-response.dto';
import { SurveyResponseItemDto } from './dto/survey-response.dto';

@ApiTags('Public')
@Controller('public/surveys')
export class PublicSurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir le questionnaire public' })
  @ApiParam({ name: 'id', description: 'ID du questionnaire' })
  @ApiQuery({ name: 'qr', required: false, description: 'Code QR de la campagne' })
  async getPublicSurvey(@Param('id', ParseUUIDPipe) id: string, @Query('qr') qr?: string) {
    return this.surveysService.getPublicSurvey(id, qr);
  }

  @Post(':id/responses')
  @ApiOperation({ summary: 'Soumettre une réponse publique' })
  @ApiParam({ name: 'id', description: 'ID du questionnaire' })
  @ApiResponse({ status: 201, type: SurveyResponseItemDto })
  async submitPublicResponse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createDto: CreateSurveyResponseDto,
    @Req() request: any,
  ): Promise<SurveyResponseItemDto> {
    return this.surveysService.submitResponse({
      ...createDto,
      surveyId: id,
      ipAddress: request.ip,
      userAgent: request.headers?.['user-agent'],
    });
  }
}
