import { Test, TestingModule } from '@nestjs/testing';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { PrismaService } from '../prisma/prisma.service';
import { PropertyType } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';

const mockUser = {
  id: 37,
  name: "kiet",
  email: "kieta0@gmail.com",
  phone: "8412312341"
}

const mockHome = {
  id: 5,
  address: "2133 Su Van Hanh District 10",
  city: "Ho Chi Minh",
  price: 50000000000,
  property_type: PropertyType.RESIDENTIAL,
  image: "image20",
  number_of_bedrooms: 4,
  number_of_badrooms: 4
}

describe('HomeController', () => {
  let controller: HomeController;
  let homeService: HomeService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [PrismaService, {
        provide: HomeService,
        useValue: {
          getHomes: jest.fn().mockReturnValue([]),
          getRealtorByHomeId: jest.fn().mockReturnValue(mockUser),
          updateHomeById: jest.fn().mockReturnValue(mockHome)
        }
      }]
    }).compile();

    controller = module.get<HomeController>(HomeController);
    homeService = module.get<HomeService>(HomeService)
  });

  describe("getHome", () => {
    it("should construct filter object correctly", async () => {
      const mockGetHomes = jest.fn().mockReturnValue([])
      jest.spyOn(homeService, "getHomes").mockImplementation(mockGetHomes)
      await controller.getHomes("Toronto", "1500000")

      expect(mockGetHomes).toHaveBeenCalledWith({
        city: "Toronto",
        price: {
          gte: 1500000,
        }
      })
    })
  })

  describe("updateHome", () => {

    const mockUserInfo = {
      name: 'kiet',
      id: 25,
      iat: 1,
      exp: 2
    }

    const mockUpdateHomeParams = {
      city: "Vancouver", 
      address: "111 yellow street", 
      numberOfBathrooms: 2, 
      numberOfBedrooms:2, 
      landSize: 4444, 
      price: 3000000, 
      propertyType: PropertyType.RESIDENTIAL, 
    }

    it("should throw auth error if realtor didn't create home", async() => {

      await expect(controller.updateHome(5, mockUpdateHomeParams, mockUserInfo)).rejects.toThrow(UnauthorizedException);
    })

    it("should update home if realtor id is valid", async () => {
      const mockUpdateHome = jest.fn().mockReturnValue(mockHome)

      jest.spyOn(homeService, "updateHomeById").mockImplementation(mockUpdateHome)

      await controller.updateHome(5, mockUpdateHomeParams,{...mockUserInfo, id: 37})

      expect(mockUpdateHome).toHaveBeenCalled()
    })
  })
});
