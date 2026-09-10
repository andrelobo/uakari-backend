import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('root')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'API info' })
  @ApiOkResponse({ description: 'Service name and status' })
  getInfo(): Record<string, string> {
    return {
      service: 'uakari-api',
      version: process.env.npm_package_version ?? '0.1.0',
      status: 'ok',
    };
  }
}