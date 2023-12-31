import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  Query,
  UseFilters,
  ParseIntPipe,
  HttpStatus,
  UsePipes,
} from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { User as UserModel, Post as PostModel, Prisma } from '@prisma/client'
import { ForbiddenException } from './exception/forbidden.exception';
import { HttpExceptionFilter } from './config/http-exception.filter';
import { CustomValidationPipe } from './config/validation.pipe';

@Controller()
export class AppController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get()
  getHello(): string {
    return 'Hello World!'
  }

  @Get('pipeline/v1/:id')
  async pipeline_v1(@Param('id', ParseIntPipe) id: number) {
    return {
      raw: id,
      after: id + 3
    };
  }

  @Get('pipeline/v2/:id')
  async pipeline_v2( 
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
  id: number) {
    return {
      raw: id,
      after: id + 3
    };
  }

  @Post('pipeline/v3')
  @UsePipes(new CustomValidationPipe())
  async pipeline_v3(@Body() request: {
    id?: number,
    name?: string,
    error?: string,
  }) {
    return {
      raw: 1,
      after: 4
    };
  }

  @Get('findError')
  // @UseFilters(new HttpExceptionFilter())
  async findError() {
    throw new ForbiddenException();
  }


  @Get('post/:id')
  async getPostById(@Param('id') id: string): Promise<PostModel> {
    return this.prismaService.post.findUnique({ where: { id: Number(id) } })
  }

  @Get('feed')
  async getFilteredPosts(
    @Query('take') take?: number,
    @Query('skip') skip?: number,
    @Query('searchString') searchString?: string,
    @Query('orderBy') orderBy?: 'asc' | 'desc',
  ): Promise<PostModel[]> {
    const or = searchString
      ? {
          OR: [
            { title: { contains: searchString } },
            { content: { contains: searchString } },
          ],
        }
      : {}

    return this.prismaService.post.findMany({
      where: {
        published: true,
        ...or,
      },
      include: { author: true },
      take: Number(take) || undefined,
      skip: Number(skip) || undefined,
      orderBy: {
        updatedAt: orderBy,
      },
    })
  }

  @Get('users')
  async getAllUsers(): Promise<UserModel[]> {
    return this.prismaService.user.findMany()
  }

  @Get('user/:id/drafts')
  async getDraftsByUser(@Param('id') id: string): Promise<PostModel[]> {
    return this.prismaService.user
      .findUnique({
        where: { id: Number(id) },
      })
      .posts({
        where: {
          published: false,
        },
      })
  }

  @Post('post')
  async createDraft(
    @Body() postData: { title: string; content?: string; authorEmail: string },
  ): Promise<PostModel> {
    const { title, content, authorEmail } = postData
    return this.prismaService.post.create({
      data: {
        title,
        content,
        author: {
          connect: { email: authorEmail },
        },
      },
    })
  }

  @Post('signup')
  async signupUser(
    @Body()
    userData: {
      name?: string
      email: string
      posts?: Prisma.PostCreateInput[]
    },
  ): Promise<UserModel> {
    const postData = userData.posts?.map((post) => {
      return { title: post?.title, content: post?.content }
    })
    return this.prismaService.user.create({
      data: {
        name: userData?.name,
        email: userData.email,
        posts: {
          create: postData,
        },
      },
    })
  }

  @Put('publish/:id')
  async togglePublishPost(@Param('id') id: string): Promise<PostModel> {
    const postData = await this.prismaService.post.findUnique({
      where: { id: Number(id) },
      select: {
        published: true,
      },
    })

    return this.prismaService.post.update({
      where: { id: Number(id) || undefined },
      data: { published: !postData?.published },
    })
  }

  @Delete('post/:id')
  async deletePost(@Param('id') id: string): Promise<PostModel> {
    return this.prismaService.post.delete({ where: { id: Number(id) } })
  }

  @Put('/post/:id/views')
  async incrementPostViewCount(@Param('id') id: string): Promise<PostModel> {
    return this.prismaService.post.update({
      where: { id: Number(id) },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    })
  }
}
