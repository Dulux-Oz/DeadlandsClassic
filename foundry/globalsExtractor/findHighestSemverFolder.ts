import fs from 'fs';
import semver from 'semver';

export function findHighestSemverFolder(directoryPath: string): string | null {
  const folderNames = fs.readdirSync(directoryPath);

  let highestSemver: string | null = null;
  let highestVersion: semver.SemVer | null = null;

  for (const folderName of folderNames) {
    // Check if the folder name matches the semver pattern
    if (semver.valid(folderName)) {
      const version = semver.parse(folderName);

      // Compare the semver numbers
      if (version !== null && (highestVersion === null || semver.gt(version, highestVersion))) {
        highestVersion = version;
        highestSemver = folderName;
      }
    }
  }

  return highestSemver;
}
