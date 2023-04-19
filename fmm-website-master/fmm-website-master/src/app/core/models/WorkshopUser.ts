import {Workshop} from './Workshop';
import {User} from './User';

export interface WorkshopUser {
  id: number;
  created_at: Date;
  updated_at: Date;
  user: User;
  workshop: Workshop;
  coupon: number;
  payment: number;
}
