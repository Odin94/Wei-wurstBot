# WeißwurstBot

## How to run:
1. Create directory `private`
2. Create `private/keys.json`
3. Put valid AppId, AppKey and azure table db key in `keys.json`
4. Update bot registration to point to a valid url (don't forget `/api/messages` at the end)
5. Run `npm install`, then `node app.js`


## Use Azure app service editor

1. make code change in the online editor

Your code changes go live as the code changes are saved.

## Use Visual Studio Code

### Build and debug
1. download source code zip and extract source in local folder
2. open the source folder in  Visual Studio Code
3. make code changes
4. download and run [botframework-emulator](https://emulator.botframework.com/)
5. connect the emulator to http://localhost:3987

### Publish back

```
npm run azure-publish
```

## Use continuous integration

If you have setup continuous integration, then your bot will automatically deployed when new changes are pushed to the source repository.



