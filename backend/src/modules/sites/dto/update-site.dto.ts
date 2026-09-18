import { PartialType } from '@nestjs/swagger';
import { CreateSiteDto } from './create-site.dto';

export class UpdateSiteDto extends PartialType(CreateSiteDto) {
  // Hérite de tous les champs de CreateSiteDto en optionnel
}
