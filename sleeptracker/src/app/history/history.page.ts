import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonItem, IonItemOption,
  IonItemOptions, IonItemSliding, IonLabel, IonList,
  IonTitle, IonToolbar, ToastController
} from '@ionic/angular/standalone';
import { OvernightSleepData } from '../data/overnight-sleep-data';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';
import { SleepService } from '../services/sleep.service';

type Entry = OvernightSleepData | StanfordSleepinessData;

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  imports: [
    DatePipe, RouterLink, IonBackButton, IonButton, IonButtons, IonContent, IonHeader,
    IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList,
    IonTitle, IonToolbar
  ]
})
export class HistoryPage {
  private readonly sleepService = inject(SleepService);
  private readonly toasts = inject(ToastController);

  entries: Entry[] = [];
  days: { date: Date; entries: Entry[] }[] = [];
  loading = true;
  error = '';
  saving = false;
  saveError = '';

  async ionViewWillEnter() {
    this.loading = true;
    this.error = '';
    this.saveError = '';
    try {
      await this.sleepService.loadData();
      this.refresh();
    } catch {
      this.error = 'Could not load your history.';
    } finally {
      this.loading = false;
    }
  }

  entryDate(entry: Entry): Date {
    return entry instanceof OvernightSleepData ? entry.sleepEnd : entry.loggedAt;
  }

  overnight(entry: Entry): OvernightSleepData | null {
    return entry instanceof OvernightSleepData ? entry : null;
  }

  async remove(entry: Entry, sliding: IonItemSliding) {
    if (this.saving || !this.entries.includes(entry)) {
      return;
    }
    this.saving = true;
    this.saveError = '';
    void sliding.close();
    try {
      if (entry instanceof OvernightSleepData) {
        await this.sleepService.deleteOvernightData(entry.id);
      } else {
        await this.sleepService.deleteSleepinessData(entry.id);
      }
    } catch {
      this.saveError = 'Could not confirm that the deletion was saved.';
      return;
    } finally {
      this.refresh();
      this.saving = false;
    }

    const toast = await this.toasts.create({
      message: 'Entry deleted',
      duration: 5000,
      buttons: [{
        text: 'Undo',
        role: 'undo',
        handler: () => this.restore(entry)
      }]
    });
    await toast.present();
  }

  private async restore(entry: Entry) {
    if (this.saving) {
      return false;
    }
    this.saving = true;
    this.saveError = '';
    try {
      if (entry instanceof OvernightSleepData) {
        await this.sleepService.logOvernightData(entry);
      } else {
        await this.sleepService.logSleepinessData(entry);
      }
    } catch {
      this.saveError = 'Could not confirm that the restored entry was saved.';
    } finally {
      this.refresh();
      this.saving = false;
    }
    return true;
  }

  private refresh() {
    this.entries = [...SleepService.AllOvernightData, ...SleepService.AllSleepinessData]
      .sort((a, b) => this.entryDate(b).getTime() - this.entryDate(a).getTime());

    this.days = [];
    for (const entry of this.entries) {
      const date = this.entryDate(entry);
      const lastDay = this.days[this.days.length - 1];
      if (lastDay && lastDay.date.toDateString() === date.toDateString()) {
        lastDay.entries.push(entry);
      } else {
        this.days.push({ date, entries: [entry] });
      }
    }
  }
}
