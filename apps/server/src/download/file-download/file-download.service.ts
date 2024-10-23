import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Watchlist } from 'src/database/entities/dowjones-watchlist.entity';
import { WatchListRepository } from 'src/entity-repository/watchlist-repository';

@Injectable()
export class FileDownloadService {
  constructor(
    @InjectRepository(Watchlist)
    private watchlistRepository: WatchListRepository,
  ) {}
  async getWatchlistData(): Promise<any[]> {
    const watchlistEntries = await this.watchlistRepository.find({
      take: 20,
      order: {
        id: 'ASC',
      },
    });
    return watchlistEntries;
  }
}
