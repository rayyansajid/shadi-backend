import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CurrentUser } from 'src/common/current-user.decorator';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { RangeAvailabilityDto, SetAvailabilityDto, UpdateAvailabilityDto } from './dto/set-availability.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('VENDOR')
@Controller('vendor')
export class VendorController {
  constructor(private service: VendorService) {}

  @Post('listings')
  createListing(@CurrentUser() user: any, @Body() dto: CreateListingDto) {
    console.log(`Creating listing for user [vendor.controller.ts]: ${JSON.stringify(user)}`);
    return this.service.createListing(user.userId, dto);
  }

  @Get('listings')
  myListings(@CurrentUser() user: any) {
    return this.service.myListings(user.userId);
  }

  @Patch('listings/:id')
  updateListing(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateListingDto) {
    return this.service.updateListing(user.userId, id, dto);
  }

  @Delete('listings/:id')
  deleteListing(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.deleteListing(user.userId, id);
  }

  /** AVAILABILITY **/
  @Post('listings/:id/availability/bulk')
  setAvailabilities(@CurrentUser() user: any, @Param('id') listingId: string, @Body() dto: SetAvailabilityDto) {
    return this.service.setAvailabilities(user.userId, listingId, dto);
  }

  @Post('listings/:id/availability/range')
  setAvailabilityRange(@CurrentUser() user: any, @Param('id') listingId: string, @Body() dto: RangeAvailabilityDto) {
    return this.service.setAvailabilityRange(user.userId, listingId, dto);
  }

  @Get('listings/:id/availability')
  getListingAvailability(
    @CurrentUser() user: any,
    @Param('id') listingId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.getListingAvailability(user.userId, listingId, from, to);
  }

  @Patch('availability/:availabilityId')
  updateAvailability(
    @CurrentUser() user: any,
    @Param('availabilityId') availabilityId: string,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.service.updateAvailability(user.userId, availabilityId, dto);
  }
}
