# SyncStage browser SDK test application

## SyncStage Desktop Agent

To use test application you need to install [SyncStage Desktop Agent](https://syncstage.s3.amazonaws.com/Agent/SyncStageAgent_1.0.0.dmg) on you Mac.
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
npm link ../syncstage-sdk-npm-package
```

