import * as Notifications from 'expo-notifications';
import { readSelfCareContext } from '../storage/selfcareContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const WEEKDAYS: Record<string, number> = {
  sunday: 1,
  monday: 2,
  tuesday: 3,
  wednesday: 4,
  thursday: 5,
  friday: 6,
  saturday: 7,
};

export async function requestPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export async function computeAndScheduleNotifications() {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  // 1. Morning Brief (8:00 AM daily)
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Morning Brief Ready',
      body: 'Your nutrition and fitness plan for the day is ready. Tap to view.',
      data: { action: 'GENERATE_MORNING_BRIEF', chatType: 'meals' },
    },
    trigger: { hour: 8, minute: 0, repeats: true },
  });

  // 2. Evening Check-in (9:00 PM daily)
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Evening Check-in',
      body: 'Time to log your day and see your progress. Tap to open Overall.',
      data: { action: 'EVENING_CHECKIN', chatType: 'overall' },
    },
    trigger: { hour: 21, minute: 0, repeats: true },
  });

  // 3. Advance Warnings (from selfcare_context.weekly_actives)
  try {
    const ctx = await readSelfCareContext();
    for (const active of ctx.weekly_actives) {
      if (active.time === 'morning') {
        const days = active.days || (active.day ? [active.day] : []);
        for (const day of days) {
          const targetDayNum = WEEKDAYS[day.toLowerCase()];
          if (targetDayNum !== undefined) {
            // Schedule at 8:00 PM the night before
            const previousDayNum = targetDayNum === 1 ? 7 : targetDayNum - 1;
            await Notifications.scheduleNotificationAsync({
              content: {
                title: 'Advance Warning',
                body: `Don't forget: ${active.task} tomorrow morning!`,
                data: { action: 'WHAT_IS_MY_ROUTINE_TONIGHT', chatType: 'selfcare' }, // Gentle nudge
              },
              trigger: {
                weekday: previousDayNum,
                hour: 20,
                minute: 0,
                repeats: true,
              },
            });
          }
        }
      }
    }
  } catch (e) {
    console.warn('Failed to schedule advance warnings:', e);
  }
}
