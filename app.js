/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
var storage = require("./storage");

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
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
var bot = new builder.UniversalBot(connector);
bot.set('storage', storage);

bot.dialog('/', function (session) {
    var response;
    try {
        response = get_response(session.message.user.name, session.message.text, session);
    } catch (err) {
        response = err;
    }

    session.send(response);
});

function get_response(user, text, session) {
    var chars = text.split("");
    var numbers = [];
    for (var char of chars) {
        var number = parseInt(char);
        if (!isNaN(number)) numbers.push(number);
    }

    if (numbers.length === 4) {
        session.userData[user] = numbers;
        session.conversationData[new Date().toISOString().replace(/:/g, "-")] = JSON.stringify(numbers);
        session.save();

        return `WW: ${numbers[0]}, Wi: ${numbers[1]}, De: ${numbers[2]}, Br: ${numbers[3]}`;
    } else {
        return `Please enter four numbers`;
    }
}