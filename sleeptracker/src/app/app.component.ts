import { Component, inject } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { IonApp, IonRouterOutlet, NavController } from '@ionic/angular/standalone';
import { SleepinessReminderService } from './services/sleepiness-reminder.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private readonly nav = inject(NavController);
  private readonly reminders = inject(SleepinessReminderService);

  ngOnInit() {
    if (this.reminders.supported) {
      void LocalNotifications.addListener('localNotificationActionPerformed', ({ notification }) => {
        if (notification.id === this.reminders.notificationId) {
          void this.nav.navigateForward('/log-sleepiness');
        }
      }).catch((error: unknown) => console.error('Could not listen for reminder taps', error));
    }
  }
}
