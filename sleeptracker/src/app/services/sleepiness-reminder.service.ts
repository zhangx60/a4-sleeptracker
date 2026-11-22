import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({ providedIn: 'root' })
export class SleepinessReminderService {
  readonly supported = Capacitor.isNativePlatform();
  readonly notificationId = 1001;

  async pendingTime(): Promise<string | null> {
    const { notifications } = await LocalNotifications.getPending();
    const reminder = notifications.find(({ id }) => id === this.notificationId);
    return reminder ? reminder.extra?.time ?? '' : null;
  }

  async schedule(time: string): Promise<boolean> {
    let { display } = await LocalNotifications.checkPermissions();
    if (display === 'prompt' || display === 'prompt-with-rationale') {
      ({ display } = await LocalNotifications.requestPermissions());
    }
    if (display !== 'granted') {
      return false;
    }

    const [hour, minute] = time.split(':').map(Number);
    await LocalNotifications.schedule({
      notifications: [{
        id: this.notificationId,
        title: 'Sleepiness check-in',
        body: 'How alert do you feel right now? Tap to log it.',
        schedule: { on: { hour, minute, second: 0 } },
        extra: { time }
      }]
    });
    return true;
  }

  async cancel() {
    await LocalNotifications.cancel({ notifications: [{ id: this.notificationId }] });
  }
}
