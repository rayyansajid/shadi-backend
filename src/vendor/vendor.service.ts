import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { SetAvailabilityDto, UpdateAvailabilityDto, RangeAvailabilityDto } from './dto/set-availability.dto';
import { addDays, parseISO } from 'date-fns';


@Injectable()
export class VendorService {
  constructor(private prisma: PrismaService) {}
  
  private async getVendorProfileIdOrThrow(userId: string) {
    console.log(`userId: ${userId}`)
    const vp = await this.prisma.vendorProfile.findUnique({ where: { userId } });
    if (!vp) throw new ForbiddenException('Vendor profile not found or not approved');
    return vp.id;
  }

  async createListing(userId: string, dto: CreateListingDto) {
    const vendorId = await this.getVendorProfileIdOrThrow(userId);
    return this.prisma.listing.create({
      data: { ...dto, vendorId },
    });
  }

  async myListings(userId: string) {
    const vendorId = await this.getVendorProfileIdOrThrow(userId);
    return this.prisma.listing.findMany({
      where: { vendorId },
      include: { availabilities: true, bookingItems: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateListing(userId: string, listingId: string, dto: UpdateListingDto) {
    const vendorId = await this.getVendorProfileIdOrThrow(userId);
    const listing = await this.prisma.listing.findFirst({ where: { id: listingId, vendorId } });
    if (!listing) throw new NotFoundException('Listing not found');

    return this.prisma.listing.update({
      where: { id: listingId },
      data: dto,
    });
  }

  async deleteListing(userId: string, listingId: string) {
    const vendorId = await this.getVendorProfileIdOrThrow(userId);
    const listing = await this.prisma.listing.findFirst({ where: { id: listingId, vendorId } });
    if (!listing) throw new NotFoundException('Listing not found');

    await this.prisma.listing.delete({ where: { id: listingId } });
    return { message: 'Deleted' };
  }

  async setAvailabilities(userId: string, listingId: string, dto: SetAvailabilityDto) {

    const vendorId = await this.getVendorProfileIdOrThrow(userId);
    const listing = await this.prisma.listing.findFirst({ where: { id: listingId, vendorId } });
    if (!listing) throw new NotFoundException('Listing not found');

    const ops = dto.items.map((i) =>
      this.prisma.availability.upsert({
        where: { listingId_date: { listingId, date: new Date(i.date) } },
        create: { listingId, date: new Date(i.date), isAvailable: i.isAvailable },
        update: { isAvailable: i.isAvailable },
      }),
    );

    await this.prisma.$transaction(ops);
    return { message: 'Availability updated' };
  }

  async updateAvailability(userId: string, availabilityId: string, dto: UpdateAvailabilityDto) {

    const availability = await this.prisma.availability.findUnique({
      where: { id: availabilityId },
      include: { listing: true },
    });

    if (!availability) throw new NotFoundException('Availability not found');

    const vendorId = await this.getVendorProfileIdOrThrow(userId);
    if (availability.listing.vendorId !== vendorId) throw new ForbiddenException('Not your listing');

    return this.prisma.availability.update({
      where: { id: availabilityId },
      data: { isAvailable: dto.isAvailable },
    });
  }

  async getListingAvailability(userId: string, listingId: string, from?: string, to?: string) {
    const vendorId = await this.getVendorProfileIdOrThrow(userId);
    const listing = await this.prisma.listing.findFirst({ where: { id: listingId, vendorId } });
    if (!listing) throw new NotFoundException('Listing not found');

    return this.prisma.availability.findMany({
      where: {
        listingId,
        ...(from && to
          ? { date: { gte: new Date(from), lte: new Date(to) } }
          : {}),
      },
      orderBy: { date: 'asc' },
    });
  }
  
  async setAvailabilityRange(userId: string, listingId: string, dto: RangeAvailabilityDto) {
    const vendorId = await this.getVendorProfileIdOrThrow(userId);
    const listing = await this.prisma.listing.findFirst({ where: { id: listingId, vendorId } });
    if (!listing) throw new NotFoundException('Listing not found');

    const isAvailable = dto.isAvailable ?? true;

    const start = parseISO(dto.from);
    const end = parseISO(dto.to);
    const items: Date[] = [];
    for (let d = start; d <= end; d = addDays(d, 1)) items.push(new Date(d));

    const ops = items.map((date) =>
      this.prisma.availability.upsert({
        where: { listingId_date: { listingId, date } },
        create: { listingId, date, isAvailable },
        update: { isAvailable },
      }),
    );

    await this.prisma.$transaction(ops);
    return { message: 'Availability range updated', daysAffected: items.length };
  }
}
