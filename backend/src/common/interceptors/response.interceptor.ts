import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ApiResponse } from '../dto/api-response.dto';
import { map, Observable } from 'rxjs';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const i18nContext = I18nContext.current(context);
    const lang = i18nContext?.lang || 'en';
    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode: ctx.getResponse().statusCode,
        message: i18nContext?.t('common.response.success') || 'OK',
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
        lang: lang,
        version: 1,
      })),
    );
  }
}
