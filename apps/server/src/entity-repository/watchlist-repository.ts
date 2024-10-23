import { Watchlist } from 'src/database/entities/dowjones-watchlist.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Watchlist)
export class WatchListRepository extends Repository<Watchlist> {}
