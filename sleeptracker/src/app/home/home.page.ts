import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { moon, sunnyOutline, timeOutline } from 'ionicons/icons';
import { OvernightSleepData } from '../data/overnight-sleep-data';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';
import { SleepService } from '../services/sleep.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonButton, IonContent, IonIcon, RouterLink],
})
export class HomePage {
  constructor(public sleepService:SleepService) {
		addIcons({ moon, sunnyOutline, timeOutline });
	}

	async ngOnInit() {
		// Load saved data from storage when the app opens
		await this.sleepService.loadData();
	}

	// The most recent overnight log, or null if none
	get lastNight():OvernightSleepData | null {
		var latest:OvernightSleepData | null = null;
		for (var i = 0; i < SleepService.AllOvernightData.length; i++) {
			var item = SleepService.AllOvernightData[i];
			if (latest == null || item.sleepEnd.getTime() > latest.sleepEnd.getTime()) {
				latest = item;
			}
		}
		return latest;
	}
	
	// "Last night" only if the latest sleep ended today; otherwise "Latest sleep"
	get lastNightLabel():string {
		var latest = this.lastNight;
		if (latest != null && latest.sleepEnd.toDateString() == new Date().toDateString()) {
			return 'Last Night';
		}
		return latest ? 'Latest Sleep' : 'Last Night';
	}

	// All sleepiness logs from today, newest first
	get todaySleepiness():StanfordSleepinessData[] {
		var today = new Date();
		var result:StanfordSleepinessData[] = [];
		for (var i = 0; i < SleepService.AllSleepinessData.length; i++) {
			var item = SleepService.AllSleepinessData[i];
			if (item.loggedAt.toDateString() == today.toDateString()) {
				result.push(item);
			}
		}
		result.sort(function(a, b) {
			return b.loggedAt.getTime() - a.loggedAt.getTime();
		});
		return result;
	}
}
