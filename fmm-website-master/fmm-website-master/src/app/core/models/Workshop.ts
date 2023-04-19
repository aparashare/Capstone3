import {User} from './User';
import {GroupCall} from '../../live-class/live-class.component';

export interface Workshop {
  id: number;
  title: string;
  subject: string;
  picture: string;
  topics: string;
  start_at: Date;
  tags: [],
  price_currency: string;
  price: string;
  presentation: string;
  created_at: Date;
  updated_at: Date;
  amount: number;
  mentor: Mentor;
  subscribed: number;
  group_call: GroupCall;
}

export interface Mentor {
  id: number;
  user: User;
}
