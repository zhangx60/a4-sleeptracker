import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { moon, sunny, sunnyOutline, timeOutline, barChartOutline } from 'ionicons/icons';
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
	// How many hours of sleep we treat as a full night
	goalHours:number = 8;
	// Current time for the flip clock (updated every second while this page is open)
	now:Date = new Date();
	private clockTimer:any = null;

  constructor(public sleepService:SleepService) {
		addIcons({ moon, sunny, sunnyOutline, timeOutline, barChartOutline });
	}

	async ngOnInit() {
		// Load saved data from storage when the app opens
		await this.sleepService.loadData();
	}
	
	/*  Flip clock */

	// Start the clock when the home page is shown...
	ionViewWillEnter() {
		this.now = new Date();
		var self = this;
		if (this.clockTimer == null) {
			this.clockTimer = setInterval(function() {
				self.now = new Date();
			}, 1000);
		}
	}

	// ...and stop it when we leave, so it doesn't keep running in the background
	ionViewDidLeave() {
		if (this.clockTimer != null) {
			clearInterval(this.clockTimer);
			this.clockTimer = null;
		}
	}

	// The 4 digits of the time in 12-hour format, e.g. 9:05 -> 0, 9, 0, 5.
	// "key" changes whenever a digit changes, so Angular redraws that card
	// and its flip animation plays.
	get clockDigits() {
		var hours = this.now.getHours() % 12;
		if (hours == 0) {
			hours = 12;
		}
		var text = this.twoDigits(hours) + this.twoDigits(this.now.getMinutes());
		var digits = [];
		for (var i = 0; i < text.length; i++) {
			digits.push({ pos: i, value: text[i], key: i + '-' + text[i] });
		}
		return digits;
	}

	get ampm():string {
		return this.now.getHours() < 12 ? 'AM' : 'PM';
	}

	// e.g. "Sunday, November 22"
	get dateText():string {
		return this.now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
	}

	twoDigits(n:number):string {
		if (n < 10) {
			return '0' + n;
		}
		return '' + n;
	}


	/* Greeting  */

	// "Good morning" / "Good afternoon" / "Good evening" based on the current hour
	get greeting():string {
		var hour = new Date().getHours();
		if (hour >= 5 && hour < 12) {
			return 'Good morning';
		} else if (hour >= 12 && hour < 18) {
			return 'Good afternoon';
		} else {
			return 'Good evening';
		}
	}

	// Show a moon at night (6pm - 6am) and a sun during the day
	get isNight():boolean {
		var hour = new Date().getHours();
		return hour >= 18 || hour < 6;
	}

	/* ---------- Last night ---------- */

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

	// How much of the sleep goal this night reached, from 0 to 100
	goalPercent(sleep:OvernightSleepData):number {
		var percent = Math.round(sleep.hoursSlept() / this.goalHours * 100);
		if (percent > 100) {
			percent = 100;
		}
		if (percent < 0) {
			percent = 0;
		}
		return percent;
	}

	/* ---------- This week chart ---------- */

	// One bar for each of the last 7 days (6 days ago ... today).
	// A night counts for the day you woke up.
	get weekBars() {
		var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		var maxHours = 10; // top of the chart
		var bars = [];

		for (var daysAgo = 6; daysAgo >= 0; daysAgo--) {
			var day = new Date();
			day.setDate(day.getDate() - daysAgo);

			// Add up all sleep that ended on this day
			var hours = 0;
			for (var i = 0; i < SleepService.AllOvernightData.length; i++) {
				var item = SleepService.AllOvernightData[i];
				if (item.sleepEnd.toDateString() == day.toDateString()) {
					hours = hours + item.hoursSlept();
				}
			}

			var height = hours / maxHours * 100;
			if (height > 100) {
				height = 100;
			}

			bars.push({
				label: dayNames[day.getDay()],
				hours: hours,
				height: height,
				isToday: daysAgo == 0
			});
		}
		return bars;
	}

	// How many of the last 7 days have a sleep log
	get nightsThisWeek():number {
		var bars = this.weekBars;
		var count = 0;
		for (var i = 0; i < bars.length; i++) {
			if (bars[i].hours > 0) {
				count = count + 1;
			}
		}
		return count;
	}

	// Average sleep over the logged days this week, e.g. "7h 12m"
	get weekAverageText():string {
		var bars = this.weekBars;
		var total = 0;
		var count = 0;
		for (var i = 0; i < bars.length; i++) {
			if (bars[i].hours > 0) {
				total = total + bars[i].hours;
				count = count + 1;
			}
		}
		if (count == 0) {
			return '';
		}
		return this.hoursText(total / count);
	}

	// 7.2 -> "7h 12m"
	hoursText(hours:number):string {
		var totalMinutes = Math.round(hours * 60);
		var h = Math.floor(totalMinutes / 60);
		var m = totalMinutes % 60;
		return h + 'h ' + m + 'm';
	}

	// 7.25 -> "7.3" (short label above each bar)
	shortHours(hours:number):string {
		return (Math.round(hours * 10) / 10).toString();
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