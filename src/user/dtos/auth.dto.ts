import { UserType } from "@prisma/client";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class SignupDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @Matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/g, {message: "Please insert valid phone number"})
    phone: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(5)
    password: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    productKey: string;

}

export class SigninDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}

export class GenerateProductKeyDto {
    @IsEmail()
    email: string;

    @IsEnum(UserType)
    userType: UserType
}