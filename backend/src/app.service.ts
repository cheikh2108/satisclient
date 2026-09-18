import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'SatisClient API',
      version: '1.0.0',
    };
  }

  getVersion() {
    return {
      version: '1.0.0',
      name: 'SatisClient API',
      description: 'Plateforme de gestion satisfaction et réclamations',
      author: 'ATAABA Expertise',
    };
  }
}
