import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    timestamp: string;
  };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // Ne pas wrapper les réponses déjà formatées { data, meta }
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          return data;
        }
        // Ne pas wrapper les réponses non-array (mutations, stats, etc.)
        if (!Array.isArray(data)) {
          return data;
        }
        // Wrapper les arrays
        return {
          data,
          meta: {
            total: data.length,
            timestamp: new Date().toISOString(),
          },
        };
      }),
    );
  }
}
