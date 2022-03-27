import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import * as nanotimer from 'nanotimer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  timer = new nanotimer();
  secondLeft = 0;
  times = {
    aegis: 5 * 60,
    before: 3 * 60,
    possible: 3 * 60,
  };
  messages = {
    aegis: 'Before the Aegis expires',
    before: 'Before Roshan can spawn',
    possible: 'Before max possible spawn',
    spawned: 'Roshan is available',
  };
  gameTime: number = 0;
  nextGameTimeEvent: number = 0;
  state: 'aegis' | 'before' | 'possible' | 'spawned' = 'spawned';
  title = 'dota-timer';
  @ViewChild('progressRing') progressRing: ElementRef | undefined;
  circumference: number = 0;
  constructor(private _electronService: ElectronService) {}
  ngOnInit() {
    console.log(this._electronService.ipcRenderer);
    this._electronService.ipcRenderer.on('gamestate', (event, arg) => {
      console.log(arg);
      if (arg.gs.map) {
        this.gameTime = arg.gs.map.clock_time;
      }
      // console.log(event);
    });
    setInterval(
      () => this._electronService.ipcRenderer.send('gamestate', 'hello'),
      1000
    );
    this._electronService.ipcRenderer.on('rosh', (event, arg) => {
      console.log(arg);
      console.log(event);
      this.state = 'aegis';
      this.secondLeft = this.times.aegis;
      this.setProgress(100);
      this.timer.setInterval(
        () => {
          console.log('tick');
          this.secondLeft--;
          console.log(this.secondLeft);
          this.setProgress((this.secondLeft / this.times['aegis']) * 100);
        },
        '',
        '1s'
      );
      this.timer.setTimeout(
        () => {
          console.log('timeout');
          this.timer.clearInterval();
          this.state = 'before';
          this.secondLeft = this.times.before;
          this.setProgress(100);
          this.timer.setInterval(
            () => {
              console.log('tick');
              this.secondLeft--;
              console.log(this.secondLeft);
              this.setProgress((this.secondLeft / this.times['before']) * 100);
            },
            '',
            '1s'
          );
          this.timer.setTimeout(
            () => {
              console.log('timeout');
              this.timer.clearInterval();
              this.state = 'possible';
              this.secondLeft = this.times.possible;
              this.setProgress(100);
              this.timer.setInterval(
                () => {
                  console.log('tick');
                  this.secondLeft--;
                  console.log(this.secondLeft);
                  this.setProgress(
                    (this.secondLeft / this.times['possible']) * 100
                  );
                },
                '',
                '1s'
              );
              this.timer.setTimeout(
                () => {
                  console.log('timeout');
                  this.timer.clearInterval();
                  this.state = 'spawned';
                  this.secondLeft = 0;
                  this.setProgress(100);
                },
                [this.timer],
                `${this.times.possible}s`
              );
            },
            [this.timer],
            `${this.times.before}s`
          );
        },
        [this.timer],
        `${this.times[this.state]}s`
      );
    });
  }

  ngAfterViewInit() {
    console.log(this.progressRing);
    if (this.progressRing) {
      let progressRingElement = this.progressRing.nativeElement;
      const radius = progressRingElement.getAttribute('r');
      this.circumference = 2 * Math.PI * radius;
      progressRingElement.setAttribute(
        'stroke-dasharray',
        `${this.circumference}, ${this.circumference}`
      );
      progressRingElement.setAttribute(
        'stroke-dashoffset',
        `${this.circumference}`
      );
      this.setProgress(100);
    }
  }
  setProgress(percent: number) {
    const offset = this.circumference - (percent / 100) * this.circumference;
    if (this.progressRing) {
      this.progressRing.nativeElement.setAttribute('stroke-dashoffset', offset);
    }
  }

  timeFormat(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;
    return `${minutes}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;
  }
}
