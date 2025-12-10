import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TransformFormDataInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const body = request.body;

    if (body && typeof body === 'object') {
      const booleanFields = ['newsletter', 'rgpd_accepted', 'cgv_accepted'];

      booleanFields.forEach((field) => {
        if (body[field] !== undefined) {
          body[field] = body[field] === 'true' || body[field] === true;
        }
      });

      const numberFields = ['age'];

      numberFields.forEach((field) => {
        if (body[field] !== undefined && body[field] !== '') {
          const num = Number(body[field]);
          if (!isNaN(num)) {
            body[field] = num;
          }
        }
      });
    }

    return next.handle();
  }
}
