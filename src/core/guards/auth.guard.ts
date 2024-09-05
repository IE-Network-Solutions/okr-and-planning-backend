import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = request.headers.authorization;
    if (!token) {
      return;
      false;
    }

    try {
      //   const decodedToken = this.jwtService.verify(token.replace('Bearer ', ''));

      //   const userId = decodedToken.sub;
      //   const user = await this.userService.findById(userId);
      //   if (!user) {
      //     return false;
      //   }

      //   const requiredRole = this.reflector.get<string>('role', context.getHandler());
      //   if (requiredRole && user.role !== requiredRole) {
      //     return false;
      //   }
      //   request.user = user;
      return true;
    } catch (error) {
      return false;
    }
  }
}
