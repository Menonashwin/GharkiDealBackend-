// src/service-provider/dto/upload-document.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UploadDocumentDto {
  @ApiProperty({ 
    type: 'string', 
    format: 'binary',
    description: 'File to upload (image or PDF)'
  })
  file: any;
}