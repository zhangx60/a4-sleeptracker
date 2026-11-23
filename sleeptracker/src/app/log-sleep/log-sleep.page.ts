import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
	IonContent, IonHeader, IonTitle, IonToolbar,
	IonButtons, IonBackButton, IonList, IonItem, IonLabel,
	IonDatetime, IonDatetimeButton, IonModal, IonButton, IonNote,
	ToastController, NavController
} from '@ionic/angular/standalone';
import { SleepService } from '../services/sleep.service';
import { OvernightSleepData } from '../data/overnight-sleep-data';

@Component({
  selector: 'app-log-sleep',
  templateUrl: './log-sleep.page.html',
  styleUrls: ['./log-sleep.page.scss'],
  standalone: true,
  imports: [
	IonContent, IonHeader, IonTitle, IonToolbar,
	IonButtons, IonBackButton, IonList, IonItem, IonLabel,
		IonDatetime, IonDatetimeButton, IonModal, IonButton, IonNote,
	FormsModule
  ]
})
export class LogSleepPage {
	// ion-datetime works with text like "2026-11-20T23:00"
	bedtime:string = '';
	wakeTime:string = '';
	// Latest time someone can pick (right now) so they can't log the future
	maxTime:string = '';
	isSaving:boolean = false;

  constructor(public sleepService:SleepService,
			  public toastController:ToastController,
			  public navController:NavController) {}

	// Runs every time this page opens, so the form starts fresh each time
	ionViewWillEnter() {
		this.isSaving = false;
		this.setDefaultTimes();
	}

	// Default: went to bed yesterday 11:00 PM, woke up today 7:00 AM
	setDefaultTimes() {
		var bed = new Date();
		bed.setDate(bed.getDate() - 1);
		bed.setHours(23, 0, 0, 0);

		var wake = new Date();
		wake.setHours(7, 0, 0, 0);

		// If it's earlier than 7am right now, don't default to a future time
		var now = new Date();
		if (wake.getTime() > now.getTime()) {
			wake = now;
		}

		this.bedtime = this.toLocalString(bed);
		this.wakeTime = this.toLocalString(wake);
		this.maxTime = this.toLocalString(now);
	}

	// Turn a Date into "YYYY-MM-DDTHH:mm" (local time) for ion-datetime
	toLocalString(date:Date):string {
		var year = date.getFullYear();
		var month = this.twoDigits(date.getMonth() + 1);
		var day = this.twoDigits(date.getDate());
		var hours = this.twoDigits(date.getHours());
		var minutes = this.twoDigits(date.getMinutes());
		return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
	}

	twoDigits(n:number):string {
		if (n < 10) {
			return '0' + n;
		}
		return '' + n;
	}

	// How long they slept, in minutes (negative if times are wrong)
	get minutesSlept():number {
		var bed = new Date(this.bedtime);
		var wake = new Date(this.wakeTime);
		return Math.round((wake.getTime() - bed.getTime()) / (1000 * 60));
	}

	// e.g. "8 hours, 0 minutes"
	get durationText():string {
		var total = this.minutesSlept;
		var hours = Math.floor(total / 60);
		var minutes = total % 60;
		return hours + ' hours, ' + minutes + ' minutes';
	}

	// Error prevention: returns a message if something is wrong, or '' if fine
	get errorMessage():string {
		if (this.bedtime == '' || this.wakeTime == '') {
			return 'Please pick both times.';
		}
		if (!Number.isFinite(this.minutesSlept) || this.minutesSlept <= 0) {
			return 'Wake-up time needs to be after bedtime.';
		}
		if (new Date(this.wakeTime).getTime() > Date.now()) {
      return 'Wake-up time cannot be in the future.';
    }
		if (this.minutesSlept > 16 * 60) {
			return 'That\'s more than 16 hours — double-check the dates.';
		}
		return '';
	}

	async saveSleep() {
		if (this.errorMessage || this.isSaving) {
			return;
		}
		this.isSaving = true;
				var sleepData = new OvernightSleepData(new Date(this.bedtime), new Date(this.wakeTime));

		try {
			await this.sleepService.logOvernightData(sleepData); // wait until it's really saved
		} catch (error) {
			// Saving failed: stay on this page so they can try again
			this.isSaving = false;
			var errorToast = await this.toastController.create({
				message: 'Could not save your sleep. Please try again.',
				duration: 3000,
				position: 'top',
				color: 'danger'
			});
			await errorToast.present();
			return;
		}

		var toast = await this.toastController.create({
						message: 'Sleep saved: ' + this.durationText + '. How alert do you feel now?',
			duration: 2000,
			position: 'top',
			color: 'success'
		});
		await toast.present();

		// Go straight to the sleepiness check-in.
		// replaceUrl: this form is taken out of the back history,
		// so Back on the sleepiness page goes home instead of to this form again.
		this.navController.navigateForward('/log-sleepiness', { replaceUrl: true });
	}
}
