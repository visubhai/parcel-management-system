import cron from 'node-cron';
import Booking from '../models/Booking';

export const initCronJobs = () => {
    // Requirement 2: Automated Parcel Status Flow
    // Runs every minute to check for transitions
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            // Threshold: 9:00 AM
            if (currentHour >= 9) {
                // We want to update parcels created BEFORE "Today 00:00:00"
                const startOfToday = new Date();
                startOfToday.setHours(0, 0, 0, 0);

                const result = await Booking.updateMany(
                    {
                        status: 'INCOMING',
                        createdAt: { $lt: startOfToday }
                    },
                    { $set: { status: 'PENDING' } }
                );

                if (result.modifiedCount > 0) {
                    console.log(`[CRON] ${result.modifiedCount} parcels transitioned from INCOMING to PENDING at ${now.toLocaleTimeString()}.`);
                }
            }
        } catch (error) {
            console.error('[CRON ERROR]', error);
        }
    });

    console.log('✅ Background Schedulers Initialized');
};
