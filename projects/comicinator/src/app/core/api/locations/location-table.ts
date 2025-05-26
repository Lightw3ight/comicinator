import { Location } from '../../models/location.interface';
import { Table } from '../../sql/table';

export const LocationTable = new Table<Location>('Location', 'id');
