const azure = require('botbuilder-azure');

// Table storage
const tableName = "WeisswurstList"; // You define
const storageName = "weisswurst"; // Obtain from Azure Portal
const storageKey = require("./private/keys.json").tableAccessKey; // Obtain from Azure Portal

const azureTableClient = new azure.AzureTableClient(tableName, storageName, storageKey);
const tableStorage = new azure.AzureBotStorage({gzipData: false}, azureTableClient);

module.exports = tableStorage;