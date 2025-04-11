import cron from "cron"
import https from "https"
import "dotenv/config"

const job = new cron.CronJob("*/14 * * * *", function () {
    https.get(process.env.API_URL, (res) => {
        if (res.statusCode === 200) console.log("GET request sent successfully");
        else console.error("GET request failed", res.satusCode);
    }).on("error", (e) => { console.error("Error while sending a request", e) }
    );
})

export default job;

// CRON Job explanation
// Cron job schedule task that run periodically at fixed intervals 
// we want to send one GET request for every 14 minutes



// how to define a schedule ?
// You define a schedule using a Cron expression, which consist of 5 fields representing:

//! MINUTE, HOUR, DAY OF THE MONTH, MONTH, DAY OF THE WEEK

//? EXAMPLES and EXPLANATIONS

// * 14 * * * * -- Every 14 minutes
// * 0 0 * * 0 -- At midnight on every Sunday
// * 30 3 15 * * -- At 3:30 AM, on the 15th of every month
// * 0 0 1 1 * -- At midnight on January 1st every year
// * 0 * * * * -- At the start of every hour