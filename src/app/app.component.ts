import { Component, OnInit } from '@angular/core';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  myWebSocket;

  ngOnInit() {

    console.log('App component ngOnInit running');

  }


  startListening() {
    console.log('Starting listening');

    this.myWebSocket = webSocket('ws://localhost:8080');
    this.myWebSocket.subscribe(
      (msg) => {
        console.log(msg)
      }, 
      (err) => {
        console.error('Error with websocket')
        console.log(err)
      },
      () => {
        console.log('Websocket connection has been closed (for whatever reason)');
      }
    );

  }


  stopListening() {
    console.log('Stopping listening');
    if (this.myWebSocket) {
      this.myWebSocket.unsubscribe();
    }
  }



}
