// src/auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract the current user from the request.
 * Usage: @CurrentUser() user: UserInterface
 * Or get specific property: @CurrentUser('id') userId: number
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    // Return specific property if provided, otherwise return the entire user object
    if (data) {
      return request.user && request.user[data];
    }
    
    return request.user;
  },
);