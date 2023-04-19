import {User} from './User';
import {UserMentorAccount} from './Mentor';

export interface MentorReview {
  title: string;
  content: string;
  mark: number;
  user: User;
  mentor: UserMentorAccount;
}
