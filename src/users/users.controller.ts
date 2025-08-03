import { Controller, Get, Post, UseGuards, Req, Param, Body, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
    // Inject the UsersService to handle user-related operations
    // Dependency Injection
    constructor(private readonly usersService: UsersService) {}
    
    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    getMe(@Req() req) {
        return req.user; // decoded JWT payload
    }

    @Get()
    async findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }


    @Post()
    async create(@Body() createuserDto:CreateUserDto){
        return this.usersService.create(createuserDto);
    }
}
