import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from "bcrypt"
import { UserType } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';


interface SignUpParams {
    email: string;
    password: string;
    name: string;
    phone: string;
}

interface SignInParams {
    email: string;
    password: string;
}
@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService
        ) {}
    async signup ({email, password, name, phone}: SignUpParams, userType: UserType) {
        const userExists = await this.prismaService.user.findUnique({
            where: {
                email
            }
        })
        if(userExists) {
            throw new BadRequestException
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const  user = await this.prismaService.user.create({
            data: {
                email,
                name,
                phone,
                password: hashedPassword,
                user_type: userType
            }
        })

        const token = await this.jwtService.sign(user)
        return token;
    }

    async signin ({email, password}: SignInParams) {
        const user = await this.prismaService.user.findUnique({
            where: {
                email
            }
        })

        if (!user) {
            throw new HttpException("Invalid Credentials", 400);
        }

        const hashedPassword = user.password;
        const isValidPassword = await bcrypt.compare(password, hashedPassword);

        if(!isValidPassword) {
            throw new HttpException("Invalid Credentials", 400)
        }

        const token = await this.jwtService.sign({
            name: user.name,
            id: user.id
        })
        return token
    }

    generateProductKey(email, userType: UserType) {
        const string = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
        return bcrypt.hash(string, 10);
    }
}
