import { Component } from '@angular/core';
import {
	IonHeader, IonToolbar, IonTitle, IonContent,
	IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
	IonList, IonItem, IonLabel, IonBadge, IonButton, IonIcon, IonNote
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { moon, cafe, list } from 'ionicons/icons';
import { SleepService } from '../services/sleep.service';
import { SleepData } from '../data/sleep-data';
import { OvernightSleepData } from '../data/overnight-sleep-data';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
    imports: [
	IonHeader, IonToolbar, IonTitle, IonContent,
	IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
	IonList, IonItem, IonLabel, IonBadge, IonButton, IonIcon, IonNote,
	RouterLink
  ],
})
export class HomePage {
  constructor(public sleepService:SleepService) {
		addIcons({ moon, cafe, list });
	}

	async ngOnInit() {
		// Load saved data from storage when the app opens
		await this.sleepService.loadData();
		console.log(this.allSleepData);
	}

	/* Ionic doesn't allow bindings to static variables, so this getter can be used instead. */
	get allSleepData() {
		return SleepService.AllSleepData;
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
	// Badge color: 1-2 green, 3-4 yellow, 5-7 red
	sleepinessColor(value:number):string {
		if (value <= 2) {
			return 'success';
		} else if (value <= 4) {
			return 'warning';
		} else {
			return 'danger';
		}
	}
	// Short comment under "Last night"
	sleepComment(hours:number):string {
		if (hours >= 7) {
			return 'Nice, that\'s a full night.';
		} else if (hours >= 5) {
			return 'A bit short — try to get to bed earlier tonight.';
		} else {
			return 'Rough night. Take it easy today.';
		}
	}
}
