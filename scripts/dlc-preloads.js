/*
################################################################################
## Copyright (c) 2023 {{Andrew}}, {{Andy}}, {{Ben}}, Matthew J Black,         ##
##    {{Haxxx}}  & {{James}}.                                                 ##
## This file is part of the *Deadlands Classic* Foundry Virtual Tabletop Game ##
##   System.                                                                  ##
## *Deadlands Classic* is free software: you can redistribute it and/or       ##
##    modify it under the terms of the GNU General Public License as          ##
##    published by the Free Software Foundation, either version 3 of the      ##
##    License, or (at your option) any later version.                         ##
## *Deadlands Classic* is distributed in the hope that it will be useful, but ##
##    WITHOUT ANY WARRANTY; without even the implied warranty of              ##
##    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU        ##
##    General Public License for more details.                                ##
## You should have received a copy of the GNU General Public License along    ##
##    with *Deadlands Classic*. If not, see <https://www.gnu.org/licenses/>.  ##
################################################################################
*/

"use strict";

"use strict";

export const fpPreloadTemplates = async function() {
  const sPrePath = `systems/deadlands-classic/templates/parts/dlc-`;
  const sCharSheetPath = `${sPrePath}character-sheet-`;
  const aTemplatePaths = [
    `${sCharSheetPath}aptitudes.html`,
    `${sCharSheetPath}biodata.html`,
    `${sCharSheetPath}combat.html`,
    `${sCharSheetPath}edges.html`,
    `${sCharSheetPath}gear.html`,
    `${sCharSheetPath}main.html`,
    `${sCharSheetPath}spells.html`,
  ];
  return loadTemplates(aTemplatePaths);
};