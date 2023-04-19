import {YuWeeUser} from '../core/models/YuWeeUser';

export interface Meeting {
  accessType: string;
  callAdmins: Array<string>;
  callMode: number;
  isCallAllowedWithoutInitiator: boolean;
  maxAllowedParticipant: number;
  meetingExpireDuration: number;
  meetingName: string;
  meetingStartTime: Date;
  meetingTokenId: Date;
  members: Array<string>;
  passcode: string;
  presenterPasscode: string;
  presenters: Array<string>;
}

export interface YuWeeSesion{
  access_token: string;
  expires_in: Date;
  refresh_token: string;
  token_type: string;
  user: YuWeeUser;
}

export interface CallData {
  callAdmins: Array<string>;
  callId: string;
  callMode: number;
  isExpired: false
  isHosted: true
  meetingExpirationTime: Date;
  meetingStartTime: Date;
  presenters: Array<string>;
  roomId: string;
}

export interface CallTokenInfo {
  ICSCallResourceId: string;
  token: string;
  icsToken: string;
}

export interface MeetingInformation {
  message: string;
  callData: CallData;
  callTokenInfo: CallTokenInfo;
  hasHostJoined: boolean;
  joineeDetails: Array<any>;
  status: string;
  sessionTokenInfo: string;
}
