import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HomeResponseDto } from './dtos/home.dto';
import { PropertyType } from '@prisma/client';
import { UserInfo } from '../user/decorators/user.decorator';

interface GetHomesParams {
    city?: string;
    price? : {
        gte?: number;
        lte?: number
    };
    propertyType?: PropertyType
}
export const homeSelect = {
    id: true,
    address: true,
    city: true,
    price: true,
    propertyType: true,
    number_of_bathrooms: true,
    number_of_bedrooms: true,
}

interface CreateHomeParams {
    address: string;
    numberOfBathrooms: number;
    numberOfBedrooms: number;
    city: string;
    price: number;
    landSize: number;
    propertyType: PropertyType
    images: {url: string}[]
}

interface UpdateHomeParams{
    address?: string;
    numberOfBathrooms?: number;
    numberOfBedrooms?: number;
    city?: string;
    price?: number;
    landSize?: number;
    propertyType?: PropertyType
}

@Injectable()
export class HomeService {

    constructor(private readonly prismaService: PrismaService) {}

    async getHomes (filters: GetHomesParams):  Promise< HomeResponseDto[]> {
        const homes = await this.prismaService.home.findMany({
            select: {
                id: true,
                address: true,
                city: true,
                price: true,
                propertyType: true,
                number_of_bathrooms: true,
                number_of_bedrooms: true,
                images: {
                    select: {
                        url: true
                    },
                    take: 1
                }
            },
            where: filters
        });
        if(homes.length === 0) throw new NotFoundException()
        return homes.map((home) => new HomeResponseDto({...home, image: home.images[0].url}))
    }
    async getHomeById(id: number): Promise<HomeResponseDto> {
        const home = await this.prismaService.home.findUnique({
          where: { id },
          select: {
            ...homeSelect,
            images: {
              select: {
                url: true,   
              },
            },
            realtor: {    
              select: {
                name: true,
                email: true,
                phone: true,
              }
            }
          },
        });
     
        if (!home) {
          throw new NotFoundException();
        }
     
        return new HomeResponseDto(home);
    }

    async createHome({city, address, numberOfBathrooms, numberOfBedrooms, landSize, price, propertyType, images}: CreateHomeParams, userId: number) {
        const home = await this.prismaService.home.create({
            data: {
                address,
                city,
                number_of_bathrooms: numberOfBathrooms,
                number_of_bedrooms: numberOfBedrooms,
                land_size: landSize,
                price,
                propertyType,
                realtor_id: userId
            }
        })

        const homeImages = images.map(image => {
            return {...image, home_id: home.id}
        })

        await this.prismaService.image.createMany({
            data: homeImages
        })

        return new HomeResponseDto(home)
    }

    async updateHomeById( id: number, data: UpdateHomeParams) {
        const home = await this.prismaService.home.findUnique({
            where: {
                id
            }
        })

        if (!home) throw new NotFoundException();

        const updatedHome = await this.prismaService.home.update({
            where: {
                id
            },
            data
        })

        return new HomeResponseDto(updatedHome)
    }

    async deleteHomeById(id: number) {
        await this.prismaService.image.deleteMany({
            where:{
                home_id: id
            }
        })
        await this.prismaService.home.delete({
            where: {
                id
            }
        })
        return;
    }

    async getRealtorByHomeId(id: number) {
        const home = await this.prismaService.home.findUnique({
            where: {
                id
            },
            select: {
                realtor:{
                    select:  {
                        name: true,
                        id: true,
                        email: true,
                        phone: true
                    }
                }
            }
        })

        if(!home) throw new NotFoundException();
        return home.realtor;
    }
    async inquire (buyer: UserInfo, homeId, message) {
        const realtor = await this.getRealtorByHomeId(homeId);
        return await this.prismaService.message.create({
            data: {
                realtor_id: realtor.id,
                buyer_id: buyer.id,
                home_id: homeId,
                message
            }
        })
    }

    async getMessagesByHome (homeId: number) {
        return await this.prismaService.message.findMany({
            where: {
                home_id:homeId
            },
            select: {
                message: true,
                buyer: {
                    select: {
                        name: true,
                        phone: true,
                        email: true
                    }
                }
            }
        })
    }
}
