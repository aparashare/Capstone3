import {UserMentorAccount} from './Mentor';

export interface User {
  id: number;
  last_login: Date;
  is_superuser: boolean;
  username: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: Date;
  email: string;
  groups: [];
  mentor_account: UserMentorAccount;
  user_permissions: [];
  personal_info: UserPersonalInfo;
  educations: UserEducations[];
  avatar: string;
}

export interface UserPersonalInfo {
  id: number;
  gender: string;
  phone: string;
  birthday: Date;
  country_of_origin: string;
  city: string;
  profession: string;
  about: string;
  preferences: string;
  created_at: Date;
  updated_at: Date;
  user: number;
}

export interface UserSocialInformation {
  id: number;
  linkedin: string;
  facebook: string;
  created_at: Date;
  updated_at: Date;
  user: number;
}

export interface UserEducations {
  id: number;
  school_name: string,
  school_start: number;
  school_end: number;
  achievements: string[],
  created_at: Date;
  updated_at: Date;
  user: number;
}
