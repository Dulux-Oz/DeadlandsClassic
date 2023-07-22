# Foundry folder
This folder houses various versions of foundry. These versions are extracted from the `/public` folder of the server version of the application.

## Extracting globals
Once you have added the version folder ([See Adding a new version](#adding-a-new-version)) run `npm run globalsExtract`. This will update the `.eslintrc.json` file inside `/foundry/globalsExtractor` which is used to extend the base config, adding all the foundry globals.

## Adding a new version

### OSX
Right-click "Show package contents" on the "Foundry Virtual Tabletop" Application, then navigate to `/Contents/Resources/app`.

In this repo's `/foundry` folder, make a new folder named the same are the new version. You can find the version of the application under the `version` key in `package.json`. Copy the `public` folder (including the folder) into this newly created version named folder.
