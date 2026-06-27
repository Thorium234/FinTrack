import cron from "node-cron";
import { processDueRecurring } from "../services/recurring.service.js";

export function startRecurringJob() {
  cron.schedule("0 6 * * *", async () => {
    try {
      const count = await processDueRecurring();
      if (count > 0) {
        console.log(`Recurring job: created ${count} transaction(s)`);
      }
    } catch (err) {
      console.error("Recurring job error:", err.message);
    }
  });
}
