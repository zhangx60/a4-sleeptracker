--Readme document for *author(s)*, *email(s)*, *UCI id(s)*--

1. How many assignment points do you believe you completed (replace the *'s with your numbers)?

*/10
- */1 The ability to log overnight sleep
- */1 The ability to log sleepiness during the day
- */1 The ability to view these two categories of logged data
- */2 Either using a native device resource or backing up logged data
- */2 Following good principles of mobile design
- */2 Creating a compelling app
- */1 A readme and demo video which explains how these features were implemented and their design rationale

2. How long, in hours, did it take you to complete this assignment?
Xinyu Zhang : 7+5+3+1 = 16 hour


3. What online resources did you consult when completing this assignment? (list specific URLs)
https://ionicframework.com/docs/api/datetime
https://ionicframework.com/docs/theming/colors
https://ionicframework.com/docs/theming/dark-mode
https://capacitorjs.com/docs/apis/preferences
https://developer.apple.com/design/human-interface-guidelines/dark-mode
https://ionicframework.com/docs/native/setup
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await



4. What classmates or other individuals did you consult as part of this assignment? What did you discuss?
Me and Yilin have split this assignment to 2 parts:
1. Set up the project structure and routes, implemented data persistence for both types of records using Capacitor Preferences, 
and built the home page and overnight sleep form, including date and time validation. 
Xinyu also designed the global light and dark themes and is responsible for README questions 1–8
packaging the project, and submitting it on Canvas.
2. Yilin is responsed on built the daytime sleepiness form using the Stanford Sleepiness Scale and the history page, including category switching, deletion, and undo. 
Yilin also implemented daily reminders using Capacitor Local Notifications and is responsible for reset of the  README questions and recording the demo video.


5. Is there anything special we need to know in order to run your code?


--Aim for no more than two sentences for each of the following questions.--


6. Did you design your app with a particular type of user in mind? If so, whom?
We designed it for college students and young adults who want an easy way to see how 
their sleep affects how alert they feel during the day. 
It is easy to loggging in so it won't take too many times in a busy morning 
and adaptable for a quick break between classes.


7. Did you design your app specifically for iOS or Android, or both?
We designed mainly for iOS, using iOS-style large titles and back buttons, 
and the colors follow the phone's Light/Dark Mode setting as Apple's design guidelines recommend.
Because it is built with Ionic, it also runs on Android.


8. How can a person log overnight sleep in your app? Why did you choose to support logging overnight sleep in this way?
On the home screen, tap "Log last night's sleep"; bedtime and wake-up time are pre-filled with 11 PM and 7 AM,
so on a typical day logging is just one tap on Save.
We show how long you slept while you edit and block impossible entries (wake-up before bedtime, 
future times, more than 16 hours, or a double-tap that would save twice) so mistakes are not saved.


9. How can a person log sleepiness during the day in your app? Why did you choose to support logging sleepiness in this way?

On the Log sleepiness page, pick one of the seven Stanford Sleepiness Scale levels and tap Save sleepiness. The app records the current time automatically so it is quick to check in several times a day.


10. How can a person view the data they logged in your app? Why did you choose to support viewing logged data in this way?

Open History and use the Overnight and Sleepiness tabs to see each type of entry, newest first. We split them into two tabs because bedtime and wake-up are easier to compare when they are grouped together, and daytime check-ins can happen several times a day.


11. Which feature choose--using a native device resource, backing up logged data, or both?

We used both Capacitor Local Notifications for daily reminders and Capacitor Preferences to keep both types of logs after closing or refreshing the app.


12. If you used a native device resource, what feature did you add? How does this feature change the app's experience for a user?

In the native app, users can choose a daily check-in time on the Log sleepiness page and turn the reminder off whenever they want. The device notification helps users remember to check in during the day, and tapping it opens the rating page.


13. If you backed up logged data, where does it back up to?
Logs are saved on the device with Capacitor Preferences (localStorage in the browser, native key-value storage on a phone) as JSON, 
and every add or delete is written to storage before the screen updates. 
Saved logs are loaded when the app opens, so they stay after closing or refreshing the app.

14. How does your app implement or follow principles of good mobile design?
The home screen is a useful initial view (latest sleep, today's check-ins, and one-tap buttons for both logs),
and Undo after deleting plus a back button on every page give users an easy "uh-oh" way out. 
We prevent errors with pre-filled time pickers, blocking impossible times, 
and keeping Save disabled until the input is valid or while saving, we aslo follow iOS conventions such as large titles, back buttons, segmented tabs, and matching the system Light/Dark Mode.