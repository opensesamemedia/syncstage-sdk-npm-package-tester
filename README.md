# SyncStage browser SDK test application

## SyncStage Desktop Agent

To use test application you need to install [SyncStage Desktop Agent](https://public.sync-stage.com/agent/macos/prod/0.1.0/SyncStageAgent_0.1.0.dmg) on you Mac.

## Supported browsers

The current version of the application and the desktop agent supports only the Google Chrome browser.

## Documentation

For more information please visit [SyncStage documentation](https://docs.sync-stage.com/) and [SyncStage webpage](https://sync-stage.com/).

## npm SDK package

https://www.npmjs.com/package/@opensesamemedia/syncstage

## Running project

`yarn start`

## Create .env with SyncStageSecrets

```
REACT_APP_SYNCSTAGE_SECRET_ID=
REACT_APP_SYNCSTAGE_SECRET_KEY=

```

## Switching to local SDK dependency

`yarn install`

To work with local sdk package run:

```
yarn remove @opensesamemedia/syncstage
yarn add ../syncstage-sdk-npm-package
```

## Firebase deployment

1. Update env with values for particular deployment.
2. `yarn build`
3. `firebase deploy --only hosting:<name of the hosting>`
