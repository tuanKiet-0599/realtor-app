import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { UserInfo } from "src/user/decorators/user.decorator";



@Injectable()
export class AuthGuard implements CanActivate{

    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService,
        private readonly prismaService: PrismaService
    ) {}

    async canActivate(context: ExecutionContext) {

        const roles: any[] = this.reflector.getAllAndOverride('roles', [
            context.getHandler(),
            context.getClass()
        ])
        
        if(roles?.length) {
            const request = context.switchToHttp().getRequest();
            const token = await request.headers?.authorization?.split('Bearer ')[1];
            
            try {
                const payload = await this.jwtService.verify(token) as UserInfo;
                
                const user = await this.prismaService.user.findUnique({
                    where: {
                        id: payload.id
                    }
                })

                if(roles.includes(user.user_type)) return true;
                return false;
            } catch (error) {
                console.log(error)
                return false
            }
            
        }
        return true;
    }
}