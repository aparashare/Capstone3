import {Component,NgZone, ElementRef, OnDestroy, OnInit,ViewChild, AfterViewInit} from '@angular/core';
import {environment} from '../../environments/environment';
import {UserService} from '../core/services/user.service';
import {YuWeeUser} from '../core/models/YuWeeUser';
import {User} from '../core/models/User';
import { Router } from '@angular/router';
import {concatMap} from 'rxjs/operators';
import {MentorReviewComponent} from '../core/mentor-review/mentor-review.component';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute} from '@angular/router';
import {WorkshopService} from '../core/services/workshop.service';
import {WorkshopUser} from '../core/models/WorkshopUser';
import * as moment from 'moment';
import {Meeting, MeetingInformation, YuWeeSesion} from './YuWeeInterfaces';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Workshop} from '../core/models/Workshop';
import {MentorService} from '../core/services/mentor.service';
import { scrollService } from '../core/services/scroll.service';
import { PushNotificationsService } from '../core/services/push.notification.service';
import { SocketService } from '../core/services/socket.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Subscription } from 'rxjs/Subscription';
import {PersistanceService} from '../core/services/persistor.service';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarHorizontalPosition,
  MatSnackBarRef,
  MatSnackBarVerticalPosition
} from '@angular/material/snack-bar';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'

declare var $:any;
declare var YuWee: any;
declare var MediaRecorder: any;

@Component({
  selector: 'app-live-class',
  templateUrl: './live-class.component.html',
  styleUrls: ['./live-class.component.sass'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0
      })),
      transition('void <=> *', animate(1000)),
    ])
  ]
})


export class LiveClassComponent implements OnInit, OnDestroy,AfterViewInit {
  private routerSubscription: Subscription;
  editorConfig: AngularEditorConfig = {
    editable: true,
      spellcheck: true,
      height: 'auto',
      minHeight: '280px',
      maxHeight: '280px',
      width: '100%',
      minWidth: '0',
      translate: 'yes',
      enableToolbar: true,
      showToolbar: true,
      placeholder: 'Enter text here...',
      defaultParagraphSeparator: '',
      defaultFontName: '',
      defaultFontSize: '',
      fonts: [
        {class: 'arial', name: 'Arial'},
        {class: 'times-new-roman', name: 'Times New Roman'},
        {class: 'calibri', name: 'Calibri'},
        {class: 'comic-sans-ms', name: 'Comic Sans MS'}
      ],
      customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
    uploadUrl: 'v1/image',
    uploadWithCredentials: false,
    sanitize: true,
    toolbarPosition: 'top',
    toolbarHiddenButtons: [
      ['insertUnorderedList',
      'insertOrderedList',
      'heading',
      'fontName',   'strikeThrough',
      'subscript',
      'superscript','undo',
      'redo',  'justifyLeft',
      'justifyCenter',
      'justifyRight',
      'justifyFull','insertUnorderedList',
      'insertOrderedList',
      'heading',
      'fontName'],
      [
      'textColor',
      'backgroundColor',
      'customClasses',
      'link',
      'unlink',
      'insertImage',
      'insertVideo',
      'insertHorizontalRule',
      'removeFormat',
      'toggleEditorMode']
    ]
};
  private yuweeUser: YuWeeUser;
  public session: YuWeeSesion;
  public yuweeUserData;
  public tempMailAdd=false;
  public y;
  public user: User;
  public userInfo;
  private subs;
  public privateUsers=[];
  public workshopId;
  public isCallStarted=false;
  public toRecordeScreen :any;
  public isScreen =false;
  public workshop: Workshop;
  public payedUsers: WorkshopUser[];
  public numberOfInvitees: string;
  public meeting: Meeting;
  public meetingInformation: MeetingInformation;
  public isMentor = false;
  public joinedTime=0;
  public activeParticipantsList = [];
  public videoToggled = false;
  public audioToggled = false;
  public screenSharingToggled = false;
  public roleUpgraded = false;
  public mentorStream = null;
  public menteesStream = null;
  public meetingEndedSuccess = false;
  public callAdminId = null;
  public newMessage = "";
  public noteHtmlContent = "<p>test</p>";
  public privateUserList = [];
  public chat_spinner=true
  public Messages = [];
  public privateNotifier = false;
  public publicNotifier = false;
  public selectedUserId:any;
  cameraState = '';
  public isRecord = true;
  public recordingState = false;
  public downloadState = false;
  public userList = false;
  public privateMessages = [];
  public togglePrivateChat = false;
  public isNotes = false;
  started = false;
  screenloaded = false;
  micState = '';
  isHandRaised = false;
  showNotes = true;
  public time = 0;
  public interval;
  toggle = true;
  public memberEmail = '';
  chat_first_time=true;
  sc = true;
  sum = 100;
  throttle = 300;
  status = 'Enable'
  pageCount=0
  public logo:any;
  public classDuration:any;
  public userSelectedRoomId:any;
  public remoteMentoSocketId:any;
  public onlineUsers=[];
  public Joinedusers=[];
  readonly mode$: Observable<string>;
  @ViewChild('localVideo') localVideo: ElementRef;
  @ViewChild('remoteVideo',{static: true}) remoteVideo: ElementRef;
  @ViewChild('menteesAudio') menteesAudio: ElementRef;
  @ViewChild('videoContainer') videoContainer: ElementRef;
  @ViewChild('otherStreams') otherStreams: ElementRef;
  @ViewChild('image', {static: true}) image: ElementRef<ImageBitmap>;
  @ViewChild('canvas', {static: true}) canvas: ElementRef<HTMLCanvasElement>;
  private scrollContainer: any;
  
  mediaRecorder:any;
  _canvas:any;
  chunks = [];
	audioFiles = [];
  container: HTMLElement; 
  constructor(private userService: UserService,
              private route: ActivatedRoute,
              private router: Router,
              private http: HttpClient,
              private workshopService: WorkshopService,
              public dialog: MatDialog,
              private scrollService:scrollService,
              private snackBar : MatSnackBar,
              private socketService : SocketService,
              private _notificationService: PushNotificationsService,
              private elementRef: ElementRef,
              private zone: NgZone,
              private persister: PersistanceService
              ) {
                this.socketService.setupSocketConnection();
                this._notificationService.requestPermission();
              }
  
              sendMessages() {
                // this.socketService.online(this.user.username)
              }
              onScroll(){
                this.pageCount = this.pageCount +1 ;
                console.log("this.workshop['room_id']",this.workshop['room_id'])
                this.y.fetchChatMessages(this.workshop['room_id'],this.pageCount*20);
              }
              scrollToBottom(): void {
                // this.scrollContainer.scroll({
                //   top: this.scrollContainer.scrollHeight,
                //   left: 0,
                //   behavior: 'smooth'
                // });               
            }
            notify(name) {
              let data: Array < any >= [];
              data.push({
                  'title': 'FindMeMentor Notification',
                  'alertContent': name+' raised his hand'
              });
              this._notificationService.generateNotification(data);
          }
            ngAfterViewInit(){
              
              
              // this.scrollCntainer = this.myScrollContainer.nativeElement; 
            }


            openFullscreen() {
              let elem = this.remoteVideo.nativeElement
              if (elem.requestFullscreen) {
                elem.requestFullscreen();
              } else if (elem.mozRequestFullScreen) { /* Firefox */
                elem.mozRequestFullScreen();
              } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
                elem.webkitRequestFullscreen();
              } else if (elem.msRequestFullscreen) { /* IE/Edge */
                elem.msRequestFullscreen();
              }
            }

            openNotes(){

              this.isNotes = true
              this.togglePrivateChat =false
              this.userList =false

              this.workshopService.getNotes({"user":this.user.id,"workshop":this.workshopId,content:this.noteHtmlContent}).subscribe((data)=>{
                
                  if(data.results.length>0){
                    this.noteHtmlContent = data.results[data.results.length-1].content
                  }
              })
            }

            startRecording() {
 

              console.log('recorder started');
              this.recordingState=false;
              this.downloadState=true;
              var options = { mimeType: "video/webm",audioBitsPerSecond : 128000,
              videoBitsPerSecond : 2500000 }
              var stream = (this.canvas.nativeElement as any).captureStream(25);
              var newStream = new MediaStream();
              newStream.addTrack(this.mentorStream.getAudioTracks()[0]);
              newStream.addTrack(stream.getVideoTracks()[0]);
              this.mediaRecorder = new MediaRecorder(newStream,options);
              this.mediaRecorder.ondataavailable = e => {

                this.chunks.push(e.data)};
          
              this.mediaRecorder.start();
              this.mediaRecorder.onstop = e => {
                console.log('data available after MediaRecorder.stop() called.');
                setTimeout(event => {
                  console.log("stopping");
                  this.download(this.chunks)
                  this.recordingState=true
                  this.downloadState = false
                }, 2000);
              };
            }
            stopRecording() {
              this.mediaRecorder.stop();
              console.log(this.mediaRecorder.state);
              console.log('recorder stopped');
            }
            onCapture(){
              this.canvas.nativeElement.height=this.localVideo.nativeElement.videoHeight;
              this.canvas.nativeElement.width=this.localVideo.nativeElement.videoWidth;
              this._canvas = this.canvas.nativeElement.getContext("2d");
              this._canvas .drawImage(this.localVideo.nativeElement, 0, 0);
              // this._canvas .globalAlpha = 0.7;

              this._canvas.drawImage(this.image.nativeElement,(this.localVideo.nativeElement.videoWidth-120),20, 90, 20);
                requestAnimationFrame(()=>this.onCapture());
            
            //   function loadImage(src, onload) {
            //     var img = new Image();
            //     img.onload = onload;
            //     img.src = src.src;
            //     return img;
            // }
          
          
          
            }
            download(chunks) {
              var blob = new Blob(chunks, {
                type: 'video/webm'
              });
              var url = URL.createObjectURL(blob);
              let a =document.createElement('a');
              document.body.appendChild(a);
              a.href = url;
              a.download = 'fmm_record_'+new Date().getTime()+'.webm';
              a.click();
              window.URL.revokeObjectURL(url);
            }
  ngOnInit(): void {


    this.socketService.onlineUsers()
    .subscribe((user:any) => {
      console.log("ONLINE USERS",user)
      this.onlineUsers=[];
      this.Joinedusers=[];
      Object.keys(user).forEach((key) =>{
        if(user[key].joinedClass){

          this.Joinedusers.push(user[key])
        }else{

          this.onlineUsers.push(user[key])
        }
      })
    });


    this.socketService.classStartetd()
    .subscribe((remoteMentoSocketId:any) => {
      this.remoteMentoSocketId = remoteMentoSocketId
      if (this.workshopId) {
        // this.workshopService.getWorkshopPayedUsers(this.workshopId)
        //   .subscribe( data => this.payedUsers = data);
        this.workshopService.getWorkshop(this.workshopId)
          .subscribe( data => {
            this.workshop = data;
            this.isCallStarted=true
            // this.startTimer();
          });
      }
    });


    this.socketService.addMenteeToRoom()
    .subscribe((user:any) => {
      this.addMember(user.email)

    });


    this.socketService.getUserRoomData()
    .subscribe((data:any) => {
      console.log("got room data",data)
      let tData=[]
      if(this.user.mentor_account){

        this.privateUserList.forEach(element =>{
        data.forEach(el => {
          element.roomId = null
            if(element.id == el.userId){
              element.roomId = el.roomId
            }
          })
          tData.push(element)
        });
        console.log("after mapped data",tData)
        this.privateUsers=tData;
      }else{
        this.privateUserList = data;
        this.createUserRoom(1);
      }

    });


    this.socketService.registeredSucessfully()
    .subscribe((data:any) => {
      this.y.fetchRoomDetails(this.workshop['room_id']);
    });


    this.socketService.onUserRoomCreated()
    .subscribe((data:any) => {
      let userList =[];

      this.privateUserList.forEach(element => {
        userList.push(element.id)
      });

      this.socketService.getUserRoom(userList);
    });


    this.subs = this.route.paramMap.subscribe( paramMap => {
      this.workshopId = +paramMap.get('id');
      if (this.workshopId) {
        // this.workshopService.getWorkshopPayedUsers(this.workshopId)
        //   .subscribe( data => this.payedUsers = data);
       
    
        this.workshopService.getWorkshop(this.workshopId)
          .subscribe( data => {
            this.workshop = data;
            this.startTimer();
            this.userService.user.subscribe(u => {
              this.user = u
              if (u.mentor_account && u.mentor_account.id === this.workshop.mentor.id) {
                this.isMentor = true;
                this.showNotes=false;
              }
              if(!this.isMentor){
                this.workshopService.getNotes({"user":this.user.id,"workshop":this.workshopId,content:this.noteHtmlContent}).subscribe((data)=>{
                
                  if(data.results.length>0){
                    this.noteHtmlContent = data.results[data.results.length-1].content
                  }
              })
              this.workshopService.getWorkshopStatus({classId:this.workshopId}).subscribe((data)=>{
                console.log("hey i am checking the class status",data)
                if(data.length>0){
                  this.isCallStarted = data[0].isStarted
                }
              })
              }
              console.log("------------adding user =------",this.user,this.workshopId)
              this.socketService.addUser({"user":this.user,"classId":this.workshopId})
            });
          });
      }
    });
  }

  autoSaveNotes(){

    console.log("I am saving data to server")
    this.workshopService.postNotes({"user":this.user.id,"workshop":this.workshopId,content:this.noteHtmlContent}).subscribe(()=>{

    })


  }


  chatDiv (type){
    this.publicNotifier=false;
    this.privateNotifier=false;
    this.isNotes = false;
    this.pageCount=0;
    this.userList=true;
    this.Messages=[];
    this.privateMessages =[];
    if(type == 'private'){

      this.togglePrivateChat=true;
      this.Messages=[];
      if(this.user.mentor_account){

        this.workshopService.getWorkshopEnrolledUsers(this.workshopId)
        .subscribe((data) =>{
          console.log("private clicked",data)
          this.privateUserList = data
          let userList =[];
    
          data.forEach(element => {
            userList.push(element.id)
          });
    
          this.socketService.getUserRoom(userList);
        })
      }else{
        console.log("my user id ",this.user)
        this.socketService.getUserRoom([this.user.id]);
      }
    }else{
      this.userList=false;
      this.togglePrivateChat=false;
      console.log("this.workshop['room_id']",this.workshop['room_id'])
      this.y.fetchChatMessages(this.workshop['room_id'],this.pageCount*20);

      
    };

  
  }
  // createPrivateRoom (type){
  //   this.userList=true;
  //   this.workshopService.getWorkshopEnrolledUsers(this.workshopId)
  //   .subscribe((data) =>{
  //     console.log("private clicked",data)
  //     let userList =[];

  //     data.forEach(element => {
  //       userList.push(element.id)
  //     });

  //     this.socketService.getUserRoom(userList);
  //   })
  // }

  public startTimer(): void {
    const classStartTime = new Date(this.workshop.start_at);
    const diff: number = Math.floor((new Date().getTime() - classStartTime.getTime()) / 1000);
    this.time = diff < 0 ? 0 : diff;

    if (diff > 0 ) {
      this.interval = setInterval(() => {
        this.time++;
      }, 1000);
    }
  }

  public duration(): void {
      this.classDuration = setInterval(() => {
        this.joinedTime++;
        // console.log("joined time ",this.joinedTime)
      }, 1000);
    
  }

  public transform(value: number): string {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value - hours * 3600) / 60);
    const seconds = value - hours * 3600 - minutes * 60;

    return `${(hours < 10 ? '0' + hours : hours)}:${(minutes < 10 ? '0' + minutes : minutes)}:${(seconds < 10 ? '0' + seconds : seconds)}`;
  }

  stringToDate(str){
    var t = new Date(str);
    return t.toLocaleTimeString()
    
  }

  startClass() {
    if(this.user.email =='prashant@findmementor.com'){
      this.tempMailAdd = true
    }
    this.activeParticipantsList =[]
    this.y = new YuWee();
    this.getYuWeeUser();
    this.setHandlersYuWee();
    this.initSession();
    this.started = true;
    this.screenloaded = true;
    this.duration()
    this.userService.getSelfYuwee().subscribe(data =>{
      this.yuweeUser = data
    });
  }

  enableDisableRule() {
    console.log("click")
    this.toggle = !this.toggle;
    this.status = this.toggle ? 'Enable' : 'Disable';
}

  ngOnDestroy(): void {
    if(!this.isMentor){

      this.autoSaveNotes()
    }
    if(this.meetingEndedSuccess==false){

      this.socketService.updateClassDuration({duration:this.joinedTime})
      if (this.isMentor) {
        this.y?.endMeeting(this.meeting.meetingTokenId, () => {
          this.mentorStream.getTracks().forEach(element => {
            element.stop();
          });
          console.log('Meeting ended successfully')
          this.socketService.classEndByMentor(this.workshopId)
          this.subs.unsubscribe();
        }

          );
      }else{
        this.y?.leaveMeeting(() => {console.log('Meeting left successfully')});
        this.subs.unsubscribe();
        if (this.routerSubscription) {
          this.routerSubscription.unsubscribe();
        }

      }
    }
  }

  getYuWeeUser() {
    this.userService.user.pipe(
      concatMap(result1 => {
        this.user = result1;
        return this.userService.getSelfYuwee();
      })
    ).subscribe(
      success => this.yuweeUser = success,
      errorData => { console.log('cant get YuWEE user' + errorData) }
    );
  }

  setHandlersYuWee() {
    const myHandlers = {
      onSessionCreateSuccess: (data) => this.sessionCreateSuccess(data),
      onSessionCreateFailure: (data) => this.sessionCreateFailure(data),
      onServerConnected: () => this.yuweeServerConnected(),
      onLocalStreamReceived: (data) => this.localStreamReceived(data),
      onRemoteStreamAvailable: (streamInfoObj) => this.remoteStreamAvailable(streamInfoObj),
      onRemoteStreamStopped: (streamInfoObj) => this.remoteStreamStopped(streamInfoObj),
      onParticipantStatusUpdated: (data) => this.participantStatusUpdated(data),
      onParticipantRoleUpdated: (data) => this.participantRoleUpdated(data),
      onParticipantMuted: (data) => this.participantMuted(data),
      onScreenSharingError: (data) => this.screenSharingError(data),
      onScreenShareStatusChanged: (statusId, stream) => this.screenShareStatusChanged(statusId, stream),
      onMeetingEnded: () => this.meetingEnded(),
      onParticipantJoined: (data) => this.participantJoined(data),
      onParticipantLeft: (data) => this.participantLeft(data),
      onParticipantHandRaised: (data) => this.participantHandRaised(data),
      onParticipantHandLowered: (data) => this.participantHandLowered(data),
      onFetchChatMessageSuccess: (data) => this.onFetchChatMessageSuccess(data),
      onMessageDeliverySuccess: (data) => this.onMessageDeliverySuccess(data),
      onNewMessageReceived: (data) => this.onNewMessageReceived(data),
      onFetchRoomDetailsSuccess: () => this.onFetchRoomDetailsSuccess(),
      onMembersAddedToGroupSuccess: (data) => this.onMembersAddedToGroupSuccess(data),
      onNewGroupCreation: (data) => this.onNewGroupCreation(data),
    };

    this.y.setHandlers(myHandlers);
  }



  onMessageDeliverySuccess(data){

 
        console.log("Message send ",JSON.stringify(data))
      let msg = {
        "dateOfCreation":data.dateOfCreation ,
        "fileInfo": null,
        "isEncrypted": data.isEncrypted,
        "isForwarded": false,
        "message": data.message,
        "messageId": data.messageId,
        "messageType": data.messageType,
        "quotedMessage": data.quotedMessage,
        "sender":{
          "email":data.sender.email,
          "image":data.sender.image,
          "name":data.sender.name,
          "_id":data.sender.senderId
        }

      }
      if(this.togglePrivateChat){

        this.privateMessages.push(msg)
      }else{

        this.Messages.push(msg)
      }
              this.scrollService.triggerScrollTo();
    }

  onNewMessageReceived(data){
    console.log("message received",data)
      var obj={
        "dateOfCreation":data.dateOfCreation ,
        "fileInfo": null,
        "isEncrypted": data.isEncrypted,
        "isForwarded": false,
        "message": data.message,
        "messageId": data.messageId,
        "messageType": data.messageType,
        "quotedMessage": data.quotedMessage,
        "sender":{
          "email":data.sender.email,
          "image":data.sender.image,
          "name":data.sender.name,
          "_id":data.sender.senderId
        }
      }
   
        if(this.workshop['room_id']== data.roomId){
          if(this.togglePrivateChat){
            this.publicNotifier=true
          }

          this.Messages.push(obj)
        }else{
          if(!this.togglePrivateChat){
            this.privateNotifier=true
          }
          this.privateMessages.push(obj)
  
        }
      
      
    this.scrollService.triggerScrollTo();
  }

  keyDownFunction(event) {
    if (event.keyCode === 13) {
      alert('you just pressed the enter key');
      // rest of your code
    }
  }
  


  initSession() {
    // console.log('environment.yuweeAppId ',environment.yuweeAppId);
    // console.log('environment.yuweeAppSecret ',environment.yuweeAppSecret);
    // console.log('environment.yuweeClientId ',environment.yuweeClientId);
    
    this.y.setAppCredentials(environment.yuweeAppId, environment.yuweeAppSecret, environment.yuweeClientId);
    this.userService.user.subscribe(u => this.user = u);
    this.userService.getSelfYuwee().subscribe(data => this.yuweeUser = data);

    this.userService.user.pipe(
      concatMap(result1 => {
        this.user = result1;
        return this.userService.getSelfYuwee();
      })
    ).subscribe(
      success => {
        this.yuweeUser = success;
        // console.log('this.user.email ', this.user.email);
        // console.log('this.yuweeUser.password ',this.yuweeUser.password);
        this.userInfo = this.y.createSessionViaCredentials(this.user.email, this.yuweeUser.password);
      }
    );
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(MentorReviewComponent, {
      width: '400px',
      data: {
        workshop: this.workshop.id,
        user: this.user
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.workshopService.postWorkshopReview(result).subscribe();
    });
  }


  sendMessageOnEnter(event){
    if (event && event.keyCode === 13) {

      // rest of your co
      if(this.newMessage.length>0){

        console.log("toggle",this.togglePrivateChat,this.userSelectedRoomId,this.workshop['room_id'])
        if(this.togglePrivateChat){
            if(!this.user.mentor_account){
              this.userSelectedRoomId  = this.privateUserList[0].roomId
            }
  
            this.y.sendMessage(this.userSelectedRoomId,this.newMessage,new Date().getTime());
            this.newMessage = ""
          }else{
  
            this.y.sendMessage(this.workshop['room_id'],this.newMessage,new Date().getTime());
            this.newMessage = ""
          }
      }

            }
  }
  sendMessage(){
    if(this.newMessage.length>0){
      if(this.togglePrivateChat){
        
              if(!this.user.mentor_account){
                this.userSelectedRoomId  = this.privateUserList[0].roomId
              }
  
        this.y.sendMessage(this.userSelectedRoomId,this.newMessage,new Date().getTime());
        this.newMessage = ""
      }else{
      
        this.y.sendMessage(this.workshop['room_id'],this.newMessage,new Date().getTime());
        this.newMessage = ""
      }
    }
  }
  onKeydown(event){
    event.preventDefault();
  }

  yuweeServerConnected() {
    console.log("hey i am connected to server",this.workshop.group_call)
    if (this.user.mentor_account && this.user.mentor_account.id === this.workshop.mentor.id) {
      this.isMentor = true;
      this.micState = 'microphone'
    }
    
    if (this.isMentor) {
      this.y.fetchRoomDetails(this.workshop['room_id']);
      this.hostMeetingAndJoinAsMentor();
    } else if (this.workshop?.group_call) {
      console.log('I am a mentee !');
      this.micState = null;
      this.isHandRaised = false;
      this.socketService.registerMeForMessages({"menteeId":this.remoteMentoSocketId,"user":this.user});
      this.registerInMeetingForMentee();
    }
  }

  addMember(email){
    this.y.addMembersInGroupByEmail(this.workshop['room_id'],[email])


  }
  createUserRoom(index){
    this.Messages = [];
    this.privateMessages = [];
    if (this.user.mentor_account) {
      let email = this.yuweeUser['yuwee_response_json'].result.email;
      console.log("this.privateUserList[index]",this.privateUserList[index])
      this.userList = false
      if(this.privateUserList[index].roomId && this.privateUserList[index].roomId !== null){
        this.userSelectedRoomId =this.privateUserList[index].roomId;
        console.log("this.privateUserList[index].roomId",this.privateUserList[index].roomId)
        this.y.fetchChatMessages(this.privateUserList[index].roomId,this.pageCount);          
      }else{
        this.selectedUserId = this.privateUserList[index];
        let userMail = this.privateUserList[index].email
        this.y.createGroup([email,userMail],'class-'+new Date().getTime());
      }
    }else{
      this.userList = false
      console.log("here outside if")
      if(this.y){
        console.log("here inside if")
        console.log("this.privateUserList[0].roomId",this.privateUserList[0].roomId)

        this.y.fetchChatMessages(this.privateUserList[0].roomId,this.pageCount);
      } 

    }


  }

  onFetchRoomDetailsSuccess(){
    console.log("this.workshop['room_id']",this.workshop['room_id'])
    this.y.fetchChatMessages(this.workshop['room_id'],this.pageCount);
  //  var amIRegistered= data.membersInfo.filter((w)=> w.email === this.yuweeUser['yuwee_response_json'].result.email)
  //  console.log("amIRegistered",amIRegistered)
  //   if(amIRegistered){
  //     this.y.addMembersInGroupByEmail(this.workshop['room_id'],[this.yuweeUser['yuwee_response_json'].result.email])
  //   }else{

  //   }

  }

  onNewGroupCreation(data){
    this.pageCount=0;
    let roomId = data.groupInfo.roomId
    var userData={};
    if(this.selectedUserId){
      userData ={
        "classId":this.workshopId,
        "userId":this.selectedUserId.id,
        "roomId":roomId
      };
    }
    this.socketService.createUserRoom(userData)
    this.userSelectedRoomId =roomId;
    console.log("--------------------roomId",roomId)
    this.y.fetchChatMessages(roomId,this.pageCount); 
 }

  onMembersAddedToGroupSuccess(data){

    console.log("added to new group")
    console.log("this.workshop['room_id']",this.workshop['room_id'])
    this.memberEmail='';
    this.y.fetchChatMessages(this.workshop['room_id'],this.pageCount);

  }


  onFetchChatMessageSuccess(data){
    console.log("this.pageCount",this.pageCount)
    console.log(this.Messages,"---------------------------",data.result.messages)
    if(!this.togglePrivateChat){
      this.Messages = data.result.messages.concat(this.Messages);
      if(this.chat_spinner){
        let that = this
        setTimeout(function(){
          that.scrollService.triggerScrollTo();
        },500)
      }
      this.chat_spinner=false

    }else{
      this.privateMessages = data.result.messages.concat(this.privateMessages);
      if(this.chat_spinner){
        let that = this
        setTimeout(function(){
          that.scrollService.triggerScrollTo();
        },500)
      }
      this.chat_spinner=false

    }


  }


  sessionCreateSuccess(data) {
    // console.log('SESSION CREATION IN YUWEE SUCCESS !', JSON.stringify(data));
    this.session = data;
    this.yuweeUserData = data.user;
    const param = {
      user: this.yuweeUserData,
      access_token: this.session.access_token
    };
    this.y.init(param);
  }

  sessionCreateFailure (data) {console.log('Failure', data)}

  hostMeetingAndJoinAsMentor(){
    const meetingParams = {
      meetingName: this.workshop.title,
      maxAllowedParticipant: this.workshop.amount,
      callMode: 1,
      meetingStartTime: moment().unix,
      meetingExpireDuration: 7200,
      presenters: [this.user.email],
      callAdmins: [this.user.email]
    };
    
    this.y.hostMeeting(meetingParams,​ (error, data) => {
       if (error) {}
       else {
         console.log("meeting id ",data)
         this.meeting = data;
         this.y.getMediaStream({ video: true,audio:true});
       }
    });
  }

  localStreamReceived(data) {
    this.recordingState = true
    this.screenloaded = true
    console.log('********** localStreamReceived ********** ', data);
    // console.log('this.videoToggled ', this.videoToggled);
    // console.log('this.audioToggled ', this.audioToggled);
    // console.log('this.screenSharingToggled ', this.screenSharingToggled);
    // console.log('this.roleUpgraded ', this.roleUpgraded);
    if(this.isMentor){
      if(!this.videoToggled && !this.audioToggled && !this.screenSharingToggled && !this.roleUpgraded){

        this.y.attachMediaStream(this.localVideo.nativeElement, data);
        console.log('this.localVideo ', this.localVideo);
        this.mentorStream = data;
        this.localVideo.nativeElement.muted = true;
        this.toRecordeScreen = data;
        this.cameraState = 'video-camera';
        this.micState = 'microphone'

        const p = new HttpParams().set('token', String(this.meeting.meetingTokenId)).set('passcode', String(this.meeting.passcode));
        this.http.post(environment.API_URL+'/api/v0/group_calls/', p).subscribe(
          (res: GroupCall) => this.http.patch(environment.API_URL+`/api/v0/workshops/${this.workshop.id}/`, {group_call: res.id}).subscribe(()=>{
            
            this.registerInMeetingForMentor();
            
          })
        )
      }else{
        // console.log('attaching my local stream to video element', data);
        this.y.attachMediaStream(this.localVideo.nativeElement, data);
        this.localVideo.nativeElement.muted = false;
        
      }
    }
  }

  registerInMeetingForMentor() {
    const registerParams = {
      nickName : this.user.first_name,
      meetingTokenId : this.meeting.meetingTokenId,
      passcode : this.meeting.presenterPasscode
  };
    this.y.registerInMeeting(registerParams,​ (err, data) => {
      if (err) {}
      else {
        this.meetingInformation = data;
        this.joinMeetingYuWee();
        this.socketService.mentorJoinedClass(this.user.username)
      }
    });
  }

  registerInMeetingForMentee() {
    if (this.workshop.group_call) {
      const registerParams = {
        nickName : this.user.first_name,
        meetingTokenId : this.workshop.group_call.token,
        passcode : this.workshop.group_call.passcode
      };
      this.y.registerInMeeting(registerParams,​ (err, data) => {
        if (err) {}
        else {
          this.socketService.joinedClass(this.user.username)
          this.meetingInformation = data;
          this.joinMeetingYuWee();
        }
      });
    }
  }

  joinMeetingYuWee() {
    const joinParams = {
      icsToken : this.meetingInformation.callTokenInfo.token,
      ICSCallResourceId : this.meetingInformation.callTokenInfo.ICSCallResourceId,
      callId : this.meetingInformation.callData.callId,
      roomId : this.meetingInformation.callData.roomId,
      callMode : this.meetingInformation.callData.callMode,
    };
    this.y.joinMeeting(​joinParams,​ (err, data) => {
      if (err) {
        console.log('err in joinMeeting' ,err)
      }
      else {
        // console.log('join Meeting data ', JSON.stringify(data));
        // console.log('*************** ', this.activeParticipantsList);
        
        this.y.fetchActiveParticipantsList((err,data) => {
              console.log('data in fetchActiveParticipantsList ', JSON.stringify(data));
              if(data!=null){
                for(var i=0; i<data.result.length;i++){
                  var paxObj = {};
                  paxObj["_id"] = data.result[i]._id;
                  paxObj["name"] = data.result[i].name;
                  paxObj["email"] = data.result[i].email;
                  if (data.result[i].isCallAdmin != undefined) {
                    paxObj["isCallAdmin"] = data.result[i].isCallAdmin;
                    if(data.result[i].isCallAdmin==true || data.result[i].isCallAdmin=='true'){
                      this.callAdminId = data.result[i]._id;
                    }
                  } else {
                    paxObj["isCallAdmin"] = false
                  }

                  if (data.result[i].isPresenter != undefined) {
                    paxObj["isPresenter"] = data.result[i].isPresenter;
                  } else {
                    paxObj["isPresenter"] = false;
                  }

                  if (data.result[i].isSubPresenter != undefined) {
                    paxObj["isSubPresenter"] = data.result[i].isSubPresenter;
                  } else {
                    paxObj["isSubPresenter"] = false;
                  }

                  if (data.result[i].isAudioOn != undefined) {
                    paxObj["isAudioOn"] = data.result[i].isAudioOn;
                    paxObj["isMuted"] = !data.result[i].isAudioOn;
                  } else {
                    if (data.result[i].isPresenter == true || data.result[i].isPresenter == 'true') {
                      paxObj["isAudioOn"] = true;
                      paxObj["isMuted"] = false;
                    } else {
                      paxObj["isAudioOn"] = false;
                      paxObj["isMuted"] = true;
                    }
                  }

                  if (data.result[i].isVideoOn != undefined) {
                    paxObj["isVideoOn"] = data.result[i].isVideoOn;
                  } else {
                    paxObj["isVideoOn"] = false;
                    // if (data.result[i].isPresenter == true) {
                    //   paxObj.isVideoOn = true;
                    // } else {
                    //   paxObj.isVideoOn = false;
                    // }
                  }

                  if (data.result[i].isScreenOn != undefined) {
                    paxObj["isScreenOn"] = data.result[i].isScreenOn;
                  } else {
                    paxObj["isScreenOn"] = false;
                  }

                  if (data.result[i].isrRecordingOn != undefined) {
                    paxObj["isrRecordingOn"] = data.result[i].isrRecordingOn;
                  } else {
                    paxObj["isrRecordingOn"] = false;
                  }

                  if (data.result[i].isHandRaised != undefined) {
                    paxObj["isHandRaised"] = data.result[i].isHandRaised;
                  } else {
                    paxObj["isHandRaised"] = false;
                  }

                  var indexOfPaxInTheList = this.activeParticipantsList.map(function(f){f._id}).indexOf(paxObj['_id']);
                  if(indexOfPaxInTheList==-1){
                    this.activeParticipantsList.push(paxObj);
                  }
                }
              }
              // console.log('*************** ', this.activeParticipantsList);
              // console.log('activeParticipantsList length ', this.activeParticipantsList.length);
          });
      }
      });
  }

  toggleVideo() {
    if(this.isMentor){
      this.videoToggled = true;
      this.y.toggleVideoPause((err, data) => {
        if(err){
          this.snackBar.open(err.message, '', {
            duration: 5000,
          }); 
        }else{
          var myIndexInPaxList = this.activeParticipantsList.map(function(f){return f._id}).indexOf(this.yuweeUserData._id)
          if(myIndexInPaxList!=-1){
            this.activeParticipantsList[myIndexInPaxList].isVideoOn = data.isVideoOn;
          }

          if(data.isVideoOn==true){
            this.cameraState = 'video-camera';
          }else{
            this.cameraState = 'no-video';
          }
        }
      });
    }else{
      this.snackBar.open('You are not authorised to publish your video!', '', {
        duration: 5000,
      }); 
    }
  }

  toggleAudio() {
    this.y.toggleAudioMute((err, data) => {
      if(err){
        this.snackBar.open(err.message, '', {
          duration: 5000,
        }); 
      }else{
        
        var myIndexInPaxList = this.activeParticipantsList.map(function(f){return f._id}).indexOf(this.yuweeUserData._id)

        if(myIndexInPaxList!=-1){
          this.activeParticipantsList[myIndexInPaxList].isAudioOn = data.isAudioOn;
          if(data.isAudioOn==true || data.isAudioOn=='true'){
            this.activeParticipantsList[myIndexInPaxList].isMuted = false;
          }else if(data.isAudioOn==false || data.isAudioOn=='false'){
            this.activeParticipantsList[myIndexInPaxList].isMuted = true;
          }
        }

        if(data.isAudioOn==true || data.isAudioOn=='true'){
          this.micState = 'microphone';
        }else{
          this.micState = 'mute';
        }
      }
    });
  }

  upgradeUserRoleAndToggleAudio(index){
    console.log('activeParticipantsList[index] => ', this.activeParticipantsList[index]);
    let userId =  this.activeParticipantsList[index]._id;
    if(this.yuweeUserData._id==this.callAdminId){
      if(userId!=this.callAdminId){
        let newRole = 'subPresenter';
        this.y.updateParticipantsRole(userId, newRole, (err,data) => {
          if(err){
            this.snackBar.open(err.message, '', {
              duration: 3000,
            });  
          }else{
            this.snackBar.open(data.message, '', {
              duration: 3000,
            });
            this.activeParticipantsList[index].isSubPresenter = true;
            
            if(this.activeParticipantsList[index].isMuted!=undefined){
              if(this.activeParticipantsList[index].isMuted==true){
                let audioStatus = true;
                console.log('Admin is unmuting a pax!');
              
                this.y.toggleParticipantAudio(userId, audioStatus,(err, data) => {
                  if(err){
                    console.log(err);
                    this.snackBar.open(err.message, '', {
                      duration: 3000,
                    });  
                  }else{
                    console.log(data);
                    this.activeParticipantsList[index].isMuted = false;
                    this.snackBar.open(data.message, '', {
                      duration: 3000,
                    });
                  }
              
                })
              }
            }
          }
        })  
      }else{
        // this is mentor..need to toggle only his audio
        if(this.activeParticipantsList[index].isMuted!=undefined){
          if(this.activeParticipantsList[index].isMuted==true){
            let audioStatus = true;
            console.log('Admin is unmuting himself !');
          
            this.y.toggleParticipantAudio(userId, audioStatus,(err, data) => {
              if(err){
                console.log(err);
                this.snackBar.open(err.message, '', {
                  duration: 3000,
                });  
              }else{
                console.log(data);
                
                this.micState = 'microphone';
                
                this.activeParticipantsList[index].isMuted = false;
                this.snackBar.open(data.message, '', {
                  duration: 3000,
                });
              }
          
            })
          }
        }
      }
    }else{
      this.snackBar.open('Only mentor can perform this action !', '', {
        duration: 3000,
      });  
    }
      
  }

  degradeUserRoleAndToggleAudio(index){
    let userId =  this.activeParticipantsList[index]._id;
    let newRole = 'viewer';
    if(this.yuweeUserData._id==this.callAdminId){
      if(userId!=this.callAdminId){
        this.y.updateParticipantsRole(userId, newRole, (err,data) => {
          if(err){
            this.snackBar.open(err.message, '', {
              duration: 3000,
            });  
          }else{
            this.snackBar.open(data.message, '', {
              duration: 3000,
            });
            
            this.activeParticipantsList[index].isSubPresenter = false;
            this.activeParticipantsList[index].isPresenter = false;
            
            if(this.activeParticipantsList[index].isMuted!=undefined){
              if(this.activeParticipantsList[index].isMuted==false){
                let audioStatus = false;
                console.log('we are muting a pax!');
              
                this.y.toggleParticipantAudio(userId, audioStatus, (err, data) => {
                  if(err){
                    console.log(err);
                    this.snackBar.open(err.message, '', {
                      duration: 3000,
                    });  
                  }else{
                    console.log(data);
                    this.activeParticipantsList[index].isMuted = true;
                    this.snackBar.open(data.message, '', {
                      duration: 3000,
                    });
                  }
                })
              }
            }
          }
        })
      }else{
        // this is mentor .. need to toggle only audio
        if(this.activeParticipantsList[index].isMuted!=undefined){
          if(this.activeParticipantsList[index].isMuted==false){
            let audioStatus = false;
            console.log('we are muting a pax!');
          
            this.y.toggleParticipantAudio(userId, audioStatus, (err, data) => {
              if(err){
                console.log(err);
                this.snackBar.open(err.message, '', {
                  duration: 3000,
                });  
              }else{
                console.log(data);
                this.activeParticipantsList[index].isMuted = true;
                this.snackBar.open(data.message, '', {
                  duration: 3000,
                });
              }
            })
          }
        }
      }
    }else{
      this.snackBar.open('Only mentor can perform this action !', '', {
        duration: 3000,
      });  
    }
  }

  screenSharingError(data) {
    console.log('screen sharing error', data);
  }

  screenShareStatusChanged(statusId, stream){
    console.log('******* screenShareStatusChanged ******** ', statusId, stream);
    if(statusId==0){
      console.log('Screen sharing has been deactivated by the mentor !');
      console.log('++ stream at 0 status ++ ', stream);
      if(!this.isMentor && this.mentorStream!=null){
        console.log("Attaching mentor's camera stream ! ", this.mentorStream);
        this.y.attachMediaStream(this.remoteVideo.nativeElement, this.mentorStream);
        this.y.attachMediaStream(this.localVideo.nativeElement, null);
        
      }else{
        if(this.isMentor && this.mentorStream!=null){
          console.log('I am the mentor. I am attaching my camera stream to localVideo element!');
          this.y.attachMediaStream(this.localVideo.nativeElement, this.mentorStream);
        }
      }
    }
    if(statusId==1){
      this.videoContainer.nativeElement.offsetHeight = '90%'
      console.log('I have activated screen sharing !')
      console.log('++ stream at 1 status ++ ', stream);
    }
    if(statusId==2){
      console.log('I have deactivated screen sharing ! ');
    }
  }

  toggleScreen() {
    this.y.toggleScreenShare();
  }

  toggleHandRaise(raiseHand){
    console.log('raiseHand ', raiseHand);
    this.y.toggleHandRaise('', raiseHand, (err, data) => {
      console.log('err ' , err)
      console.log('data ', JSON.stringify(data));
      if(!err){
        if(raiseHand==true || raiseHand=='true'){
          this.isHandRaised = true
        }else{
          this.isHandRaised = false;
        }

        var myIndexInPaxList = this.activeParticipantsList.map(function(f){return f._id}).indexOf(this.yuweeUserData._id)
        if(myIndexInPaxList!=-1){
          this.activeParticipantsList[myIndexInPaxList].isHandRaised = raiseHand;
        }
      }
    })
  }

  lowerUserHand(userId){
    this.y.toggleHandRaise(userId, false, (err, data) => {
      console.log('err ' , err)
      console.log('data ', JSON.stringify(data));
      if(!err){
        var indexInPaxList = this.activeParticipantsList.map(function(f){return f._id}).indexOf(userId)
        if(indexInPaxList!=-1){
          this.activeParticipantsList[indexInPaxList].isHandRaised = false;
        }

      }
    })
  }

  participantHandRaised(data){
    console.log('onParticipantHandRaised ', JSON.stringify(data));
    var indexInPaxList = this.activeParticipantsList.map(function(f){return f._id}).indexOf(data.userId)
    if(indexInPaxList!=-1){
      this.activeParticipantsList[indexInPaxList].isHandRaised = true;
      var paxName = this.activeParticipantsList[indexInPaxList].name;
      this.notify(this.activeParticipantsList[indexInPaxList].name)
      this.snackBar.open(paxName + ' has raised his hand!' , '' , {duration : 5000});
    }

    if(data.userId==this.yuweeUserData._id){
      this.isHandRaised = true
    }

  }

  participantHandLowered(data){
    console.log('onParticipantHandLowered => ', JSON.stringify(data));
    var indexInPaxList = this.activeParticipantsList.map(function(f){return f._id}).indexOf(data.userId)
    if(indexInPaxList!=-1){
      this.activeParticipantsList[indexInPaxList].isHandRaised = false;
    }

    if(data.userId==this.yuweeUserData._id){
      this.isHandRaised = false;
    }
  }

  quitMeeting() {
    this.socketService.updateClassDuration({duration:this.joinedTime})
    if (this.isMentor) {
      this.y?.endMeeting(this.meeting.meetingTokenId, () => {
          console.log('Meeting ended successfully')
          this.activeParticipantsList=[]
          this.started = false
          this.recordingState = false
          this.downloadState = false
          this.screenloaded = false
          this.micState = null
          this.localVideo.nativeElement.src = null;
          this.meetingEndedSuccess = true;
          this.mentorStream.getTracks().forEach(element => {
            element.stop();
          });
          this.remoteVideo.nativeElement.src = null;
          this.socketService.classEndByMentor(this.workshopId)
          this.socketService.exitClass(this.user)
          this.subs.unsubscribe();
          clearInterval(this.classDuration);
     
        }
      );
    }else{
      if(!this.isMentor){
        this.autoSaveNotes()
      }
      this.y?.leaveMeeting(() => {  
        console.log('Meeting ended successfully')
        this.activeParticipantsList=[]
        this.meetingEndedSuccess = true;
        this.socketService.exitClass(this.user)
        this.elementRef.nativeElement.remove();
        this.subs.unsubscribe();
      });
    }

    
  }
  
  meetingEnded() {
    this.socketService.updateClassDuration({duration:this.joinedTime})
    this.snackBar.open('Mentor has ended the class !', '', {
      duration: 5000,
    });
    this.y?.leaveMeeting(() => {
      this.started=false
      console.log('Meeting ended successfully')});
      this.activeParticipantsList=[]
    this.subs.unsubscribe();
    this.socketService.exitClass(this.user);
    // this.openDialog();
  }
  
  participantJoined(data){
    console.log('New Participant joined ', JSON.stringify(data));
    data.info['isMuted'] = !data.info['isAudioOn'];
    var indexInPaxList = this.activeParticipantsList.map(function(f){return f._id}).indexOf(data.userId)
    if(indexInPaxList==-1){
      this.activeParticipantsList.push(data.info);
    }else{
      this.activeParticipantsList.splice(indexInPaxList, 1);
      this.activeParticipantsList.push(data.info);
    }
  }

  participantLeft(data) {
    console.log('Participant Left ', JSON.stringify(data));
    var indexInPaxList = this.activeParticipantsList.map(function(f){return f._id}).indexOf(data.userId)
    if(indexInPaxList==-1){}else{
      this.activeParticipantsList.splice(indexInPaxList, 1);
    }
  }

  participantStatusUpdated(data){
    console.log('participantStatusUpdated => ', JSON.stringify(data));
    var indexInPaxList = this.activeParticipantsList.map(function(f){return f._id}).indexOf(data.userId)
    if(indexInPaxList==-1){}else{
      if (data.info.isAudioOn != undefined && data.info.isAudioOn != "" && data.info.isAudioOn != null) {
        this.activeParticipantsList[indexInPaxList].isAudioOn = data.info.isAudioOn
        if(data.info.isAudioOn==true || data.info.isAudioOn=='true'){
          this.activeParticipantsList[indexInPaxList].isMuted = false;
        }else if(data.info.isAudioOn==false || data.info.isAudioOn=='false'){
          this.activeParticipantsList[indexInPaxList].isMuted = true;
        }
      }
      if (data.info.isVideoOn != undefined && data.info.isVideoOn != "" && data.info.isVideoOn != null) {
        this.activeParticipantsList[indexInPaxList].isVideoOn = data.info.isVideoOn;
        if(this.activeParticipantsList[indexInPaxList].isPresenter==true){
          if(this.activeParticipantsList[indexInPaxList].isVideoOn==false && this.activeParticipantsList[indexInPaxList].isAudioOn==false){
            this.y.attachMediaStream(this.remoteVideo.nativeElement, null);
          }
        }
      }
      if (data.info.isScreenOn || data.info.isScreenOn == true || data.info.isScreenOn == false) {
        this.activeParticipantsList[indexInPaxList].isScreenOn = data.info.isScreenOn
      }
      if (data.info.isRecordingOn || data.info.isRecordingOn == true || data.info.isRecordingOn == false) {
        this.activeParticipantsList[indexInPaxList].isRecordingOn = data.info.isRecordingOn
      }
      if (data.info.isHandRaised || data.info.isHandRaised == true || data.info.isHandRaised == false) {
        this.activeParticipantsList[indexInPaxList].isHandRaised = data.info.isHandRaised
      }
    }
  }

  participantMuted(data) {
    console.log('participantMuted ', JSON.stringify(data));
    
    if(data.userId==this.yuweeUserData._id){
      this.toggleAudio();
      if (data.isMuted == true) {
        console.log('admin has muted me');
        this.snackBar.open('Admin has muted me!', '' ,{
          duration: 5000,
        }); 
        this.micState = null;
      }else{
        this.snackBar.open('Admin has given me access to speak! My microphone is now active.', '' ,{
          duration: 5000,
        }); 
        this.micState = 'microphone';
      }
    }else{
      var indexInPaxList = this.activeParticipantsList.map(function(f){return f._id}).indexOf(data.userId)
      if(indexInPaxList==-1){}else{
        if (data.isMuted == true) {
          this.activeParticipantsList[indexInPaxList].isMuted = true;
          this.activeParticipantsList[indexInPaxList].isAudioOn = false;
        }else{
          this.activeParticipantsList[indexInPaxList].isMuted = false;
          this.activeParticipantsList[indexInPaxList].isAudioOn = true;
        }
      }
    }
  }

  participantRoleUpdated(data){
    console.log('participantRoleUpdated : ', JSON.stringify(data));
    // {"userId":"5f1ef763b6f5b77cc095e54d","callId":"5f48fbaaa2fb63139c2f55cd","isPresenter":true,"newRole":"subPresenter","senderId":"5f1eeb23b6f5b77cc095e54a"}
    var indexInPaxList = this.activeParticipantsList.map(function(f){return f._id}).indexOf(data.userId);
    if(indexInPaxList!=-1){
      if(data.newRole=='presenter'){
        this.activeParticipantsList[indexInPaxList].isPresenter = true;
      }
      if(data.newRole=='subPresenter'){
        this.activeParticipantsList[indexInPaxList].isSubPresenter = true;
      }
      if(data.newRole=='viewer'){
        this.activeParticipantsList[indexInPaxList].isPresenter = false;
        this.activeParticipantsList[indexInPaxList].isSubPresenter = false;
      }
    }
  }

  remoteStreamStopped(streamInfoObj) {
    console.log('********** remoteStreamStopped *********** of user ', streamInfoObj.userId,' and ***** streamType ***** ', streamInfoObj.streamType)
    if(streamInfoObj.streamType=='screen'){
      if(!this.isMentor){
        this.y.attachMediaStream(this.remoteVideo.nativeElement, this.mentorStream);
      }else{
        this.y.attachMediaStream(this.remoteVideo.nativeElement, null);
      }
    }
  }

  remoteStreamAvailable(streamInfoObj) {
    // this.onCapture()
    this.screenloaded = true
    console.log('streamInfoObj ', JSON.stringify(streamInfoObj));
    console.log('********** remoteStreamAvailable *********** of user ', streamInfoObj.userId,' userName => ', streamInfoObj.userName,' and ***** streamType ***** ', streamInfoObj.streamType, ' role = ', streamInfoObj.role);
    if((streamInfoObj.role=='presenter' || streamInfoObj.role=='subPresenter') && streamInfoObj.userId != this.yuweeUser.id ){
      var mediaConstraints = {'audio' : true, 'video' : true}
      this.y.subscribeStream(streamInfoObj.userId, streamInfoObj.streamType, mediaConstraints, (err,data)=> {
        if(err){
          console.log(err);
        }else{
          console.log(JSON.stringify(data));
        
          if(this.callAdminId == streamInfoObj.userId){
            if(streamInfoObj.streamType=='user'){
              this.mentorStream = data.stream;
              this.toRecordeScreen = data.stream;
              console.log('this.mentorStream ', this.mentorStream);
              this.y.attachMediaStream(this.remoteVideo.nativeElement, data.stream);
            }

            if(streamInfoObj.streamType=='screen'){
              this.isScreen = true;
              console.log('this.mentorStream ', this.mentorStream);
              this.toRecordeScreen = data.stream;
              this.y.attachMediaStream(this.remoteVideo.nativeElement, data.stream);
              this.y.attachMediaStream(this.localVideo.nativeElement, this.mentorStream);
            }
          }else{
            this.menteesStream = data.stream;
            console.log('this is the stream of any other mentee!');
            var menteesAudioDiv = this.otherStreams.nativeElement;
            console.log('menteesAudioDiv ', menteesAudioDiv);
            var menteesAudioTag = document.createElement('video');
            menteesAudioTag.setAttribute('autoplay' , 'true');
            menteesAudioTag.setAttribute('playsinline' , 'true');
            menteesAudioTag.id = 'menteesAudio-'+streamInfoObj.userId;
            
            this.y.attachMediaStream(menteesAudioTag, data.stream);
            menteesAudioDiv.appendChild(menteesAudioTag);
          }

        }
      });
    }
  }

}

export interface GroupCall {
  id: number;
  passcode: string;
  token: string;
  created_at: Date;
  updated_at: Date;
}
