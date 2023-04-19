import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as io from 'socket.io-client';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SocketService {
    socket;
  constructor() { }


  setupSocketConnection() {
    this.socket = io(environment.SOCKET_ENDPOINT);
    // this.socket = io("https://signal.findmementor.com");
    // this.socket = io("http://localhost:4000",{transports: ['polling']});
  };

  addUser(user){
    this.socket.emit('joinMeToClass', user);
  };
  joinedClass(username){
    this.socket.emit('joinedClass', username);
  };
  exitClass(username){
    this.socket.emit('exitClass', username);
  };
  mentorJoinedClass(username){
    this.socket.emit('mentorJoinedClass', {});
  };
  registerMeForMessages(user){
    this.socket.emit('registerMeForMessages', user);
  };
  registeredSucessfully(){
    return Observable.create(observer => {
      this.socket.on('registeredInroomm', (data) => {
          observer.next(data);
        });
    })
  };
  addMenteeToRoom(){
    return Observable.create(observer => {
      this.socket.on('addMenteeToRoom', (data) => {
          observer.next(data);
        });
    })
  };
  classStartetd(){
    return Observable.create(observer => {
      this.socket.on('classStartetd', (data) => {
          observer.next(data);
        });
    })
  };
  classEndByMentor(workshopId){
    this.socket.emit('classEnded', workshopId);
  };
  updateClassDuration(status){
    this.socket.emit('updateClassDuration', status);
  };

  onlineUsers(){
  return Observable.create(observer => {
    this.socket.on('onlineUsers', (data: any) => {
        observer.next(data);
      });
  })
}

createUserRoom(user){
  this.socket.emit('createUserRoom', user);
};
getUserRoom(userIds){
  this.socket.emit('getUserRoom', userIds);
};
getUserRoomData(){
  return Observable.create(observer => {
    this.socket.on('getUserRoomData', (data) => {
        observer.next(data);
      });
  })
};
onUserRoomCreated(){
  return Observable.create(observer => {
    this.socket.on('onUserRoomCreated', (data) => {
        observer.next(data);
      });
  })
};

}

