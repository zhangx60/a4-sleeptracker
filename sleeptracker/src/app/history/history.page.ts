import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonItem, IonItemOption,
  IonItemOptions, IonItemSliding, IonLabel, IonList, IonSegment, IonSegmentButton,
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
    IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonSegment,
    IonSegmentButton, IonTitle, IonToolbar
  ]
})
export class HistoryPage {
  private readonly sleepService = inject(SleepService);
  private readonly toasts = inject(ToastController);

  category: 'overnight' | 'sleepiness' = 'overnight';
  entries: Entry[] = [];
  loading = true;
  error = '';

  async ionViewWillEnter() {
    this.loading = true;
    this.error = '';
    try {
      await this.sleepService.loadData();
      this.refresh();
    } catch {
      this.error = 'Could not load your history.';
    } finally {
      this.loading = false;
    }
  }

  selectCategory(value: unknown) {
    if (value === 'overnight' || value === 'sleepiness') {
      this.category = value;
      this.refresh();
    }
  }

  entryDate(entry: Entry): Date {
    return entry instanceof OvernightSleepData ? entry.sleepEnd : entry.loggedAt;
  }

  overnight(entry: Entry): OvernightSleepData | null {
    return entry instanceof OvernightSleepData ? entry : null;
  }

  async remove(entry: Entry, sliding: IonItemSliding) {
    if (!this.entries.includes(entry)) {
      return;
    }
    void sliding.close();
    if (entry instanceof OvernightSleepData) {
      this.sleepService.deleteOvernightData(entry.id);
    } else {
      this.sleepService.deleteSleepinessData(entry.id);
    }
    this.refresh();

    const toast = await this.toasts.create({
      message: 'Entry deleted',
      duration: 5000,
      buttons: [{
        text: 'Undo',
        role: 'undo',
        handler: () => {
          if (entry instanceof OvernightSleepData) {
            this.sleepService.logOvernightData(entry);
          } else {
            this.sleepService.logSleepinessData(entry);
          }
          this.refresh();
        }
      }]
    });
    await toast.present();
  }

  private refresh() {
    const source = this.category === 'overnight'
      ? SleepService.AllOvernightData
      : SleepService.AllSleepinessData;
    this.entries = [...source].sort((a, b) => this.entryDate(b).getTime() - this.entryDate(a).getTime());
  }
}
