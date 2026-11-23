import { Component, inject } from '@angular/core';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonItem,
  IonList, IonRadio, IonRadioGroup, IonTitle, IonToolbar, NavController
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
    IonList, IonRadio, IonRadioGroup, IonTitle, IonToolbar
  ]
})
export class LogSleepinessPage {
  private readonly sleepService = inject(SleepService);
  private readonly nav = inject(NavController);

  readonly reminders = inject(SleepinessReminderService);
  reminderTime = '14:00';
  reminderActive = false;
  reminderBusy = true;
  reminderStatus = '';

  readonly levels = StanfordSleepinessData.ScaleValues.slice(1);
  selectedLevel: number | null = null;
  saving = false;
  error = '';

  ionViewWillEnter() {
    this.selectedLevel = null;
    this.saving = false;
    this.error = '';
    if (this.reminders.supported) {
      this.reminderStatus = '';
      void this.loadReminder();
    }
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

    this.saving = true;
    this.error = '';
    try {
      await this.sleepService.logSleepinessData(new StanfordSleepinessData(level));
    } catch {
      this.error = 'Could not confirm the save. Check History before trying again.';
      this.saving = false;
      return;
    }
    await this.nav.navigateBack('/home');
  }
}
