import { Injectable } from '@angular/core';
import { SleepData } from '../data/sleep-data';
import { OvernightSleepData } from '../data/overnight-sleep-data';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class SleepService {
	private static LoadDefaultData:boolean = false;
	public static AllSleepData:SleepData[] = [];
	// Keys used to save data in Preferences storage
	private static OvernightKey:string = 'overnightData';
	private static SleepinessKey:string = 'sleepinessData';
	// load from storage once
	private static DataLoaded:boolean = false;
	public static AllOvernightData:OvernightSleepData[] = [];
	public static AllSleepinessData:StanfordSleepinessData[] = [];

	constructor() {
		if(SleepService.LoadDefaultData) {
			this.addDefaultData();
		SleepService.LoadDefaultData = false;
	}
	}

	private addDefaultData() {
		var goToBed = new Date();
		goToBed.setDate(goToBed.getDate() - 1); //set to yesterday
		goToBed.setHours(1, 3, 0); //1:03am
		var wakeUp = new Date();
		wakeUp.setTime(goToBed.getTime() + 8 * 60 * 60 * 1000); //Sleep for exactly eight hours, waking up at 9:03am
		this.logOvernightData(new OvernightSleepData(goToBed, wakeUp)); // add that person was asleep 1am-9am yesterday
		var sleepinessDate = new Date();
		sleepinessDate.setDate(sleepinessDate.getDate() - 1); //set to yesterday
		sleepinessDate.setHours(14, 38, 0); //2:38pm
		this.logSleepinessData(new StanfordSleepinessData(4, sleepinessDate)); // add sleepiness at 2pm
		goToBed = new Date();
		goToBed.setDate(goToBed.getDate() - 1); //set to yesterday
		goToBed.setHours(23, 11, 0); //11:11pm
		wakeUp = new Date();
		wakeUp.setTime(goToBed.getTime() + 9 * 60 * 60 * 1000); //Sleep for exactly nine hours
		this.logOvernightData(new OvernightSleepData(goToBed, wakeUp));
	}

	public logOvernightData(sleepData:OvernightSleepData) {
		SleepService.AllSleepData.push(sleepData);
		SleepService.AllOvernightData.push(sleepData);
		this.saveData();
	}

	public logSleepinessData(sleepData:StanfordSleepinessData) {
		SleepService.AllSleepData.push(sleepData);
		SleepService.AllSleepinessData.push(sleepData);
		this.saveData();
	}

	// Delete Data
	public deleteOvernightData(id:string) {
		var newList:OvernightSleepData[] = [];
		for (var i = 0; i < SleepService.AllOvernightData.length; i++) {
			if (SleepService.AllOvernightData[i].id != id) {
				newList.push(SleepService.AllOvernightData[i]);
			}
		}
		SleepService.AllOvernightData = newList;
		this.rebuildAllSleepData();
		this.saveData();
	}
	public deleteSleepinessData(id:string) {
		var newList:StanfordSleepinessData[] = [];
		for (var i = 0; i < SleepService.AllSleepinessData.length; i++) {
			if (SleepService.AllSleepinessData[i].id != id) {
				newList.push(SleepService.AllSleepinessData[i]);
			}
		}
		SleepService.AllSleepinessData = newList;
		this.rebuildAllSleepData();
		this.saveData();
	}
	// AllSleepData = the two lists put together
	private rebuildAllSleepData() {
		var combined:SleepData[] = [];
		for (var i = 0; i < SleepService.AllOvernightData.length; i++) {
			combined.push(SleepService.AllOvernightData[i]);
		}
		for (var j = 0; j < SleepService.AllSleepinessData.length; j++) {
			combined.push(SleepService.AllSleepinessData[j]);
		}
		SleepService.AllSleepData = combined;
	}

	// storage data func
	// Preferences can only store strings, so turn the arrays into JSON text
	private async saveData() {
		await Preferences.set({
			key: SleepService.OvernightKey,
			value: JSON.stringify(SleepService.AllOvernightData)
		});
		await Preferences.set({
			key: SleepService.SleepinessKey,
			value: JSON.stringify(SleepService.AllSleepinessData)
		});
	}

	// Call this once when the app opens at home page
	public async loadData() {
		if (SleepService.DataLoaded) {
			return;
		}
		SleepService.DataLoaded = true;

		var overnightResult = await Preferences.get({ key: SleepService.OvernightKey });
		var sleepinessResult = await Preferences.get({ key: SleepService.SleepinessKey });

		// Rebuild real OvernightSleepData objects
		var overnightList:OvernightSleepData[] = [];
		if (overnightResult.value != null) {
			var savedOvernight:any[] = JSON.parse(overnightResult.value);
			for (var i = 0; i < savedOvernight.length; i++) {
				var item = savedOvernight[i];
				var overnight = new OvernightSleepData(new Date(item.sleepStart), new Date(item.sleepEnd));
				overnight.id = item.id;
				overnight.loggedAt = new Date(item.loggedAt);
				overnightList.push(overnight);
			}
		}

		// Same for sleepiness
		var sleepinessList:StanfordSleepinessData[] = [];
		if (sleepinessResult.value != null) {
			var savedSleepiness:any[] = JSON.parse(sleepinessResult.value);
			for (var j = 0; j < savedSleepiness.length; j++) {
				var entry = savedSleepiness[j];
				var sleepiness = new StanfordSleepinessData(entry.loggedValue, new Date(entry.loggedAt));
				sleepiness.id = entry.id;
				sleepinessList.push(sleepiness);
			}
		}

		SleepService.AllOvernightData = overnightList;
		SleepService.AllSleepinessData = sleepinessList;
		this.rebuildAllSleepData();
	}
}
