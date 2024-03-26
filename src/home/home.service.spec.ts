import { Test, TestingModule } from '@nestjs/testing';
import { HomeService, homeSelect } from './home.service';
import { PrismaService } from '../prisma/prisma.service';
import { PropertyType } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

const mockGetHomes = [
  {
    id: 5,
    address: "2133 Su Van Hanh District 10",
    city: "Ho Chi Minh",
    price: 50000000000,
    property_type: PropertyType.RESIDENTIAL,
    "images": [
        {
            "url": "image20"
        }
    ],
    image: "image20",
    number_of_bedrooms: 4,
    number_of_badrooms: 4
}]

const mockGetHome = {
  id: 5,
  address: "2133 Su Van Hanh District 10",
  city: "Ho Chi Minh",
  price: 50000000000,
  propertyType: "RESIDENTIAL",
  images: [
      {
          "url": "image20"
      },
      {
          "url": "image25"
      }
  ],
  realtor: {
      name: "kiet",
      email: "kieta0@gmail.com",
      phone: "8412312341"
  },
  numberOfBedrooms: 4,
  numberOfBadrooms: 4
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

const mockImages = [
  {
    id: 1,
    url: "src1"
  }, {
    id: 2,
    url: "src2"
  }
]

const mockFindImages = [
  {
    url: "src1"
  }, {
    url: "src2"
  }
]

const mockRealtor = {
  name: 'kiet',
  email: 'kieta0@gmail.com',
  iat: 1,
  exp: 1
}


describe('HomeService', () => {
  let service: HomeService;
  let prismaService : PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HomeService, {
        provide: PrismaService,
        useValue: {
          home: {
            findMany: jest.fn().mockReturnValue(mockGetHomes),
            findUnique: jest.fn().mockReturnValue(mockGetHome),
            create: jest.fn().mockReturnValue(mockHome),
          },
          image: {
            createMany: jest.fn().mockReturnValue(mockImages),
            findMany: jest.fn().mockReturnValue(mockImages)
          }
        }
      }],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  // test getHomes endpoint
  describe("getHomes", () => {
    const filters = {
      city: "Ho Chi Minh",
      price : {
          gte: 2000000000,
          lte: 60000000000
      },
      propertyType: PropertyType.RESIDENTIAL
  }
    it("should call prisma home.findMany with correct params", async () => {
    
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHomes)
      jest.spyOn(prismaService.home, "findMany").mockImplementation(mockPrismaFindManyHomes)
    
      await service.getHomes(filters)
      expect(mockPrismaFindManyHomes).toHaveBeenCalledWith({
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
      })
    })
    //  test if getHomes endpoint can't find anyhomes meet the requirements
    it("should throw not found exception if no homes are found",async () => {

      const mockPrismaFindManyHomes = jest.fn().mockReturnValue([])
      jest.spyOn(prismaService.home, "findMany").mockImplementation(mockPrismaFindManyHomes)

      await expect(service.getHomes(filters)).rejects.toThrow(NotFoundException)
    })
  })
    // test createHome endpoint 
  describe("createHome", () => {

    const mockCreateHomeParams = {
      city: "Vancouver", 
      address: "111 yellow street", 
      numberOfBathrooms: 2, 
      numberOfBedrooms:2, 
      landSize: 4444, 
      price: 3000000, 
      propertyType: PropertyType.RESIDENTIAL, 
      images: [{
        url: "src1"
      }]
    }
    it("should call prisma home.create with the correct payload", async() => {
      const mockCreateHome = jest.fn().mockReturnValue(mockHome)
      jest.spyOn(prismaService.home, "create").mockImplementation(mockCreateHome)

      await service.createHome(mockCreateHomeParams, 5)
      expect(mockCreateHome).toHaveBeenCalledWith({
        data: {
          address: "111 yellow street",
          city: "Vancouver",
          number_of_bathrooms:2,
          number_of_bedrooms: 2,
          land_size: 4444,
          price: 3000000,
          propertyType: PropertyType.RESIDENTIAL,
          realtor_id: 5 
      }
      })
    })
    it("should call primsa image.createMany with the correct payload", async() => {
      const mockCreateManyImage = jest.fn().mockReturnValue(mockImages);

      jest.spyOn(prismaService.image, "createMany").mockImplementation(mockCreateManyImage)

      await service.createHome(mockCreateHomeParams, 5)

      expect(mockCreateManyImage).toHaveBeenCalledWith({
        data: [
          {
            url: "src1",
            home_id: 5
          }
        ]
      })

    })

  })

  describe("getHomeById", () => {

    const mockHomeId = 5
    const filter = {
      where: { id: mockHomeId },
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
    }
    it("should call prisma home.findUnique with the correct payload", async () => {
      const mockPrismaGetOneHome = jest.fn().mockReturnValue(mockGetHome)

      jest.spyOn(prismaService.home, "findUnique").mockImplementation(mockPrismaGetOneHome)

      await service.getHomeById(mockHomeId)
      expect(mockPrismaGetOneHome).toHaveBeenCalledWith(filter)
    })


   // should throw an NotFound Error when can't find a house with the id
    it("should throw an NotFound Exception when no home return", async() => {
      const mockPrismaGetNoHome = jest.fn().mockReturnValue(undefined)

      jest.spyOn(prismaService.home, "findUnique").mockImplementation(mockPrismaGetNoHome)

      await expect(service.getHomeById(1000)).rejects.toThrow(NotFoundException)
      
    }) 

  })
  describe("updateHomeById", () => {
    
    it("should call primsa home.findUnique and prisma home.update with the correct pay load ")
  })
});
