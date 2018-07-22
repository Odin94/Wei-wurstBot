/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

const restify = require('restify');
const builder = require('botbuilder');
const builderTeams = require('botbuilder-teams');
const storage = require("./storage");
const moment = require("moment-timezone");


// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
const connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
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

bot.dialog('/', function (session) {
    let response;
    try {
        response = get_response(session);
    } catch (err) {
        response = err;
    }

    session.send(response);
});

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