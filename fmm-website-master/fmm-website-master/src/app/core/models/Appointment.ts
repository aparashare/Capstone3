import {Mentor} from './Workshop';

export interface Appointment {
  title: string;
  subject: string;
  topics: string;
  start_at: Date;
  tags: Array<string>;
  price: string;
  mentor: Mentor;
}

export interface AppointmentUser {
  user: number;
  appointment: Appointment;
  payment: number;
}

export interface AppointmentAssignment {
  finish_till: Date;
  appointment: Appointment;
}
