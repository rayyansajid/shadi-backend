import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  console.log(`Current user decorator called: ${JSON.stringify(req.user)}`);
  return req.user; // { userId, email, role }
});