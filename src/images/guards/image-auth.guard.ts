import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AccessTokenPayload } from '../../auth/auth.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class ImageAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  // TODO: Check permissions for image
  async canActivate(context: ExecutionContext) {
    const isLoggedIn = await this.isLoggedIn(context);
    return isLoggedIn;
  }

  private async isLoggedIn(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
        token,
        {
          secret: this.configService.get('JWT_KEY'),
        },
      );
      const user = await this.usersService.getUser({ id: payload.sub });
      return !!user;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: Request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
