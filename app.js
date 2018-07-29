/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

const restify = require('restify');
const builder = require('botbuilder');
const builderTeams = require('botbuilder-teams');
const storage = require("./storage");
const moment = require("moment-timezone");

const keys = require("./private/keys.json");

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
const connector = new builderTeams.TeamsChatConnector({
    appId: keys.appId, // TODO: replace these with new ones from channel bot, then host with ngrok and set endpoint to your ngrok url
    appPassword: keys.appPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
 * Bot Storage: This is a great spot to register the private state storage for your bot. 
 * We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
 * For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
 * ---------------------------------------------------------------------------------------- */

// Create your bot with a function to receive messages from the user
const bot = new builder.UniversalBot(connector);
bot.set('storage', storage);

const dialog = new builder.IntentDialog();

dialog.matches(/(.*?)/, [
    (session, args, next) => {
        console.log("match anything");
        session.send("match anything");
    }
]);

// channel dialog
dialog.matches(/^memes/i, [
    (session, args, next) => {
        console.log("memes message");
        try {
            connector.fetchChannelList(
                session.message.address.serviceUrl,
                session.message.sourceEvent.team.id,
                (err, result) => {
                    if (err) {
                        session.endDialog(JSON.stringify(err));
                    } else {
                        session.send("nicememes");
                        session.endDialog(JSON.stringify(result));
                    }
                }
            )
        } catch (err) {
            session.send("There was an error; chances are it's cause you're in a private conversation and not in a channel.");
            session.endDialog(JSON.stringify(err));
        }
    }
]);

// 1 on 1 dialog
dialog.matches(/^wwsummary/i, [
    (session, args, next) => {
        console.log("wwsummary message");
        if (session.message.text.toLowerCase() === "wwsummary") {
            const address = {
                channelId: 'msteams',
                user: {
                    id: session.message.user.id
                },
                channelData: {
                    tenant: {
                        id: session.message.sourceEvent.tenant.id
                    }
                },
                bot: {
                    id: keys.appId,
                    name: "WeisswurstBot"
                },
                serviceUrl: session.message.address.serviceUrl,
                useAuth: true
            };
            session.send("nicememes");
            bot.beginDialog(address, 'WW_summary_this_week');
        }
    }
]);

bot.dialog('WW_summary_this_week', (session, args, next) => {
    builder.Prompts.text(session, "Hi buddy");
    // TODO: send WW summary for the week here
});

bot.dialog('/', dialog);

//          function (session) {
//     let response;
//     try {
//         response = get_response(session);
//     } catch (err) {
//         response = err;
//     }

//     session.send(response);
// });

function get_response(session) {
    const chars = session.message.text.split("");
    const order = [];
    for (let char of chars) {
        const number = parseInt(char);
        if (!isNaN(number)) order.push(number);
    }

    if (order.length === 4) {
        set_current_order(order, session);

        return `WW: ${order[0]}, Wi: ${order[1]}, De: ${order[2]}, Br: ${order[3]}`;
    } else {
        return `Please enter four numbers`;
    }
}

function set_current_order(order, session) {
    const momentBerlin = moment.tz("Europe/Berlin");

    let current_week = momentBerlin.week();
    if (momentBerlin.isoWeekday() >= 5) current_week += 1; // orders made on/after Friday count for next week

    session.userData[session.message.user.name] = order;
    session.conversationData[current_week] = order;
    session.save();
}