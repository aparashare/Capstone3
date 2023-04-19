export interface UserMentorAccount {
  id: number;
  tags: [];
  status: string;
  years_of_experience: number;
  about_expertise: string;
  half_charge_currency: string;
  half_charge: string;
  full_charge_currency: string;
  full_charge: string;
  created_at: Date;
  updated_at: Date;
  user: number | ShortUser;
  checked_by: number;
  expertise: Expertise[];
  achievements: [];
  can_create_free_workshops: boolean;
}

export interface UserMentorSchedule {
  id: number;
  day: string;
  start_at: string;
  end_at: string;
  timezone: string;
  created_at: Date;
  updated_at: Date;
  mentor: number;
}

export interface Expertise {
  id: number;
  title: string;
  created_at: Date;
  updated_at: Date;
}

export interface ShortUser {
  first_name: string;
  last_name: string;
  avatar: string;
  id: number;
  rating: number;
}
