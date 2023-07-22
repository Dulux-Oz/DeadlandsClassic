import { createEslintFileFromGlobalVariables } from "./createEslintFileFromGlobalVariables";
import { findHighestSemverFolder } from "./findHighestSemverFolder";
import { extractGlobalVariables } from "./extractGlobalVariables";
import { knownGlobals } from "./constants";

// Provide the path to your JavaScript file here
const highestSemverFolder = findHighestSemverFolder('./foundry');
if (!highestSemverFolder) {
  throw new Error('No valid semver folders found in the directory.');
}
const jsFilePath = `./foundry/${highestSemverFolder}/public/scripts/foundry.js`;
const globalVariables = extractGlobalVariables(jsFilePath);

createEslintFileFromGlobalVariables(globalVariables.concat(knownGlobals));
