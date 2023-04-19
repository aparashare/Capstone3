import {User} from './User';

export interface WorkshopAssignment {
  id: number;
  file: string;
  finish_till: Date;
  created_at: Date;
  updated_at: Date;
  workshop: number;
}

export interface WorkshopAssignmentUser {
  status: string;
  user: User;
  assignment: WorkshopAssignment;
}
