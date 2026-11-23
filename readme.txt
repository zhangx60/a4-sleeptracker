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



5. Is there anything special we need to know in order to run your code?



--Aim for no more than two sentences for each of the following questions.--


6. Did you design your app with a particular type of user in mind? If so, whom?



7. Did you design your app specifically for iOS or Android, or both?



8. How can a person log overnight sleep in your app? Why did you choose to support logging overnight sleep in this way?



9. How can a person log sleepiness during the day in your app? Why did you choose to support logging sleepiness in this way?

On the Log sleepiness page, pick one of the seven Stanford Sleepiness Scale levels and tap Save sleepiness. The app records the current time automatically so it is quick to check in several times a day.


10. How can a person view the data they logged in your app? Why did you choose to support viewing logged data in this way?

Open History and use the Overnight and Sleepiness tabs to see each type of entry, newest first. We split them into two tabs because bedtime and wake-up are easier to compare when they are grouped together, and daytime check-ins can happen several times a day.


11. Which feature choose--using a native device resource, backing up logged data, or both?

We used both Capacitor Local Notifications for daily reminders and Capacitor Preferences to keep both types of logs after closing or refreshing the app.


12. If you used a native device resource, what feature did you add? How does this feature change the app's experience for a user?

In the native app, users can choose a daily check-in time on the Log sleepiness page and turn the reminder off whenever they want. The device notification helps users remember to check in during the day, and tapping it opens the rating page.


13. If you backed up logged data, where does it back up to?


14. How does your app implement or follow principles of good mobile design?

The home screen shows the latest overnight entry, today's sleepiness logs, and buttons for both logging tasks, and the sleepiness form keeps Save disabled until a level is selected. We used Ionic back buttons and tabs for familiar navigation and gave users an Undo after deleting a history entry.
