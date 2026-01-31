import cron from 'node-cron';
import Booking from '../models/Booking';

export const initCronJobs = () => {
    // Requirement 2: Automated Parcel Status Flow
    // Runs every minute to check for transitions
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            // Server time based check for 05:00 AM today
            const today5AM = new Date();
            today5AM.setHours(5, 0, 0, 0);

            // Find parcels with status "INCOMING" that were created before 05:00 AM of the current day
            // If current time is after 05:00 AM, then "Today 05:00 AM" is the threshold.
            // If current time is before 05:00 AM, then "Yesterday 05:00 AM" would have been the threshold but conceptually they shouldn't change until it hits 5 AM.

            // The requirement says: "At next day exactly 05:00 AM (server time): All parcels with status INCOMING automatically change to: PENDING"
            // This means if it was created at 10 PM on Monday, at 5 AM on Tuesday it becomes PENDING.

            const result = await Booking.updateMany(
                {
                    status: 'INCOMING',
                    createdAt: { $lt: today5AM }
                },
                { $set: { status: 'PENDING' } }
            );

            if (result.modifiedCount > 0) {
                console.log(`[CRON] ${result.modifiedCount} parcels transitioned from INCOMING to PENDING.`);
            }
        } catch (error) {
            console.error('[CRON ERROR]', error);
        }
    });

    console.log('✅ Background Schedulers Initialized');
};
