import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Scope } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";


@Injectable({scope: Scope.REQUEST})
export class UserInterceptor implements NestInterceptor {
    constructor(private readonly jwtService: JwtService) {}
    
    async intercept(context: ExecutionContext, handler: CallHandler) {
        const request = context.switchToHttp().getRequest();
        const token = request?.headers?.authorization?.split('Bearer ')[1];
        const user = this.jwtService.decode(token)
        request.user = user;

        return handler.handle()
    }
}