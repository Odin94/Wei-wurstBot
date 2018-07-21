var azure = require('botbuilder-azure');

// Table storage
var tableName = "WeisswurstList"; // You define
var storageName = "weisswurst"; // Obtain from Azure Portal
var storageKey = require("./private/keys.json").tableAccessKey; // Obtain from Azure Portal

var azureTableClient = new azure.AzureTableClient(tableName, storageName, storageKey);
var tableStorage = new azure.AzureBotStorage({gzipData: false}, azureTableClient);

module.exports = tableStorage;