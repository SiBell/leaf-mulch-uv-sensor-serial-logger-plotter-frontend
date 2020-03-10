import { Component, OnInit } from '@angular/core';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import * as check from 'check-types';
import {concat} from 'lodash';

declare const google: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  private myWebSocket;
  private static googleLoaded: any;
  private dataArray;

  ngOnInit() {

    console.log('App component ngOnInit running');

    // This approach is loosely based on the following:
    // https://stackoverflow.com/questions/37542408/angular2-google-charts-how-to-integrate-google-charts-in-angular2
    if(!AppComponent.googleLoaded) {
      AppComponent.googleLoaded = true;
      // 'current' gets the latest official release, but you could provide a frozen version instead, e.g. '45'.
      google.charts.load('current',  {packages: ['corechart']});
    }
    google.charts.setOnLoadCallback(() => {
      console.log('google.charts.setOnLoadCallback running');
    });

    this.initialiseDataArray();

  }


  drawChart() {

    console.log('Drawing Chart');

    var data = google.visualization.arrayToDataTable(this.dataArray);

    var options = {
      title: 'Photo Diode differentials',
      legend: { position: 'bottom' },
      pointsVisible: false,
      pointSize: 4,
      lineWidth: 2,
      interpolateNulls: true,
      yAxis: {
        title: 'Photo Diode Differential'
      },
      hAxis: {
        gridlines: {
          color: 'none',
        },
        format: 'HH:mm:ss'
      }
    };

    var chart = new google.visualization.LineChart(document.getElementById('line-chart'));

    chart.draw(data, options);

  }


  initialiseDataArray() {
    this.dataArray = [['Time', 'Photo Diode 1', 'Photo Diode 2', 'Photo Diode 3']];
  }


  startListening() {
    console.log('Starting listening');

    this.myWebSocket = webSocket('ws://localhost:8080');
    this.myWebSocket.subscribe(
      (msg) => {
        
        console.log(msg);

        // Checks
        if (check.not.nonEmptyObject(msg)) {
          console.error('Websocket msg must be a non-empty object');
        }
        if (check.not.nonEmptyString(msg.time)) {
          console.error('Websocket msg must have a time property that is a string');
        }
        if (check.not.array.of.number(msg.data)) {
          console.error('Websocket msg must have a data property that is an array of numbers');
        }
        const dataLength = 3;
        if (msg.data.length !== dataLength) {
          console.error(`Websocket data array must have a length of ${dataLength}`)
        }

        this.dataArray.push(concat(new Date(msg.time), msg.data));
        this.drawChart();

      }, 
      (err) => {
        console.error('Error with websocket');
        console.log(err);
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
