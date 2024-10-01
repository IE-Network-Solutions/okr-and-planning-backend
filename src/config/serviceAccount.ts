import { ConfigService } from '@nestjs/config';

export default function serviceAccount(configService: ConfigService): any {
  return {
    type: configService.get<string>('firebase.type'),
    project_id: configService.get<string>('firebase.project_id'),
    private_key: configService
      .get<string>('firebase.private_key')
      ?.replace(/\\n/g, '\n'),
    client_email: configService.get<string>('firebase.client_email'),
  };
}
