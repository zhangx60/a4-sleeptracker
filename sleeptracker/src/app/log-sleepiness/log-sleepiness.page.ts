import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonItem,
  IonList, IonRadio, IonRadioGroup, IonTitle, IonToolbar, NavController,
  IonLabel, IonDatetime, IonDatetimeButton, IonModal
} from '@ionic/angular/standalone';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';
import { SleepService } from '../services/sleep.service';
import { SleepinessReminderService } from '../services/sleepiness-reminder.service';

@Component({
  selector: 'app-log-sleepiness',
  templateUrl: './log-sleepiness.page.html',
  styleUrls: ['./log-sleepiness.page.scss'],
  imports: [
    IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonItem,
    IonList, IonRadio, IonRadioGroup, IonTitle, IonToolbar,IonLabel, IonDatetime, IonDatetimeButton, IonModal
  ]
})
export class LogSleepinessPage {
  private readonly sleepService = inject(SleepService);
  private readonly nav = inject(NavController);
  private readonly route = inject(ActivatedRoute);

  readonly reminders = inject(SleepinessReminderService);
  reminderTime = '14:00';
  reminderActive = false;
  reminderBusy = true;
  reminderStatus = '';

  readonly levels = StanfordSleepinessData.ScaleValues.slice(1);
  selectedLevel: number | null = null;
  saving = false;
  error = '';

  // When this check-in happened, as text like "2026-11-20T07:00" (for ion-datetime)
  checkInTime: string = '';
  // Latest time that can be picked (right now), so no future check-ins
  maxTime: string = '';

  ionViewWillEnter() {
    this.selectedLevel = null;
    this.saving = false;
    this.error = '';
    this.setCheckInTime();
    if (this.reminders.supported) {
      this.reminderStatus = '';
      void this.loadReminder();
    }
  }

    // Default time = now. If we came from Log Sleep, the link has ?at=<wake-up time>,
  // so a sleep logged for an earlier day gets its check-in on that same morning.
  setCheckInTime() {
    var now = this.toLocalString(new Date());
    this.maxTime = now;
    this.checkInTime = now;

    var at = this.route.snapshot.queryParamMap.get('at');
    if (at != null) {
      var atDate = new Date(at);
      if (!isNaN(atDate.getTime()) && atDate.getTime() <= new Date().getTime()) {
        this.checkInTime = this.toLocalString(atDate);
      }
    }
  }

  // Turn a Date into "YYYY-MM-DDTHH:mm" (local time) for ion-datetime
  toLocalString(date: Date): string {
    var month = this.twoDigits(date.getMonth() + 1);
    var day = this.twoDigits(date.getDate());
    var hours = this.twoDigits(date.getHours());
    var minutes = this.twoDigits(date.getMinutes());
    return date.getFullYear() + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
  }

  twoDigits(n: number): string {
    if (n < 10) {
      return '0' + n;
    }
    return '' + n;
  }

  private async loadReminder() {
    this.reminderBusy = true;
    try {
      const time = await this.reminders.pendingTime();
      this.reminderActive = time !== null;
      if (time) {
        this.reminderTime = time;
      }
    } catch {
      this.reminderStatus = 'Could not check the reminder. Reopen this page to try again.';
      return;
    }
    this.reminderBusy = false;
  }

  async setReminder() {
    if (this.reminderBusy || !/^([01]\d|2[0-3]):[0-5]\d$/.test(this.reminderTime)) {
      return;
    }

    this.reminderBusy = true;
    try {
      if (await this.reminders.schedule(this.reminderTime)) {
        this.reminderActive = true;
        this.reminderStatus = 'Daily reminder saved.';
      } else {
        this.reminderStatus = 'Allow notifications in device settings to set a reminder.';
      }
    } catch {
      this.reminderStatus = 'Could not schedule the reminder. Try again.';
    } finally {
      this.reminderBusy = false;
    }
  }

  async disableReminder() {
    if (this.reminderBusy) {
      return;
    }
    this.reminderBusy = true;
    try {
      await this.reminders.cancel();
      this.reminderActive = false;
      this.reminderStatus = 'Daily reminder turned off.';
    } catch {
      this.reminderStatus = 'Could not turn off the reminder. Try again.';
    } finally {
      this.reminderBusy = false;
    }
  }

  async save() {
    const level = this.selectedLevel;
    if (this.saving || level === null || !Number.isInteger(level) || !this.levels[level - 1]) {
      return;
    }

    var loggedAt = new Date(this.checkInTime);
    if (isNaN(loggedAt.getTime()) || loggedAt.getTime() > new Date().getTime()) {
      this.error = 'Please pick a time that is not in the future.';
      return;
    }

    this.saving = true;
    this.error = '';
    try {
      await this.sleepService.logSleepinessData(new StanfordSleepinessData(level, loggedAt));
    } catch {
      this.error = 'Could not confirm the save. Check History before trying again.';
      this.saving = false;
      return;
    }
    await this.nav.navigateBack('/home');
  }
}
