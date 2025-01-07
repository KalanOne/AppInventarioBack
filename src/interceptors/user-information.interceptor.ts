import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Observable } from 'rxjs';
import { User } from 'src/entities/entities/user.entity';

@Injectable()
export class UserInformationInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userIp = request.connection.remoteAddress;
    const user: User = request.user;
    const jwtToken = request.headers['authorization']?.split(' ')[1];

    this.cls.set('ip', userIp);
    this.cls.set('user', user);
    this.cls.set('jwtToken', jwtToken);

    return next.handle();
  }
}
