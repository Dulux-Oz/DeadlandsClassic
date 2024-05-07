export const dlcConfig = {
  Ascii:
    '\n\n' +
    '  -------------------------------------------------\n' +
    '   ______               _ _                 _\n' +
    '   |  _  \\             | | |               | |\n' +
    '   | | | |___  __ _  __| | | __ _ _ __   __| |___\n' +
    "   | | | / _ \\/ _` |/ _` | |/ _` | '_ \\ / _` / __|\n" +
    '   | |/ /  __/ (_| | (_| | | (_| | | | | (_| \\__ \n' +
    '   |___/ \\___|\\__,_|\\__,_|_|\\__,_|_| |_|\\__,_|___/\n' +
    '          _____ _               _\n' +
    '         /  __ \\ |             (_)\n' +
    '         | /  \\/ | __ _ ___ ___ _  ___\n' +
    '         | |   | |/ _` / __/ __| |/ __|\n' +
    '         | \\__/\\ | (_| \\__ \\__ \\ | (__\n' +
    '          \\____/_|\\__,_|___/___/_|\\___|\n' +
    '  =================================================\n\n\n',

  dieTypes: ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'],
  valueType: ['trait', 'aptitude', 'chip'],
  traits: [
    'Cognition',
    'Deftness',
    'Knowledge',
    'Mien',
    'Nimbleness',
    'Quickness',
    'Smarts',
    'Spirit',
    'Strength',
    'Vigor',
    'Special',
  ],
  aptitudes: {
    Academia: {
      trait: 'Knowledge',
      concentrations: ['Philosophy', 'History', 'Occult'],
    },
    "Animal Wranglin'": {
      trait: 'Mien',
      concentrations: ['Bronco Busting', 'Dog Training'],
    },
    'Area Knowledge': {
      trait: 'Knowledge',
      concentrations: ['Home county'],
      default: 1,
    },
    Artillery: {
      trait: 'Cognition',
      concentrations: ['Cannons', 'Gatling Guns', 'Rockets'],
    },
    Arts: {
      trait: 'Cognition',
      concentrations: ['Painting', 'Sculpting', 'Sketching'],
    },
    Bluff: { trait: 'Smarts', concentrations: [] },
    Bow: { trait: 'Deftness', concentrations: [] },
    "Climbin'": { trait: 'Nimbleness', concentrations: [], default: 1 },
    Demolition: { trait: 'Knowledge', concentrations: [] },
    Disguise: { trait: 'Knowledge', concentrations: [] },
    Dodge: { trait: 'Nimbleness', concentrations: [] },
    "Drivin'": {
      trait: 'Nimbleness',
      concentrations: ['Steam Boat', 'Ornithopter', 'Steam Wagon'],
    },
    Faith: {
      trait: 'Spirit',
      concentrations: ['Buddist', 'Christian', 'Other'],
    },
    "Fightin'": {
      trait: 'Nimbleness',
      concentrations: [
        "Brawlin'",
        'Knife',
        'Lariat',
        'Sword',
        'Whip',
        "Wrasslin'",
      ],
    },
    "Filchin'": { trait: 'Deftness', concentrations: [] },
    "Gamblin'": { trait: 'Smarts', concentrations: [] },
    Guts: { trait: 'Spirit', concentrations: [] },
    "Hexslingin'": { trait: 'Special', concentrations: [] },
    "Horse Ridin'": { trait: 'Nimbleness', concentrations: [] },
    Languages: {
      trait: 'Knowledge',
      concentrations: [
        'Apache',
        'English',
        'French',
        'Gaelic',
        'German',
        'Latin',
        'Mandarin',
        'Portugese',
        'Sign Language (Indian)',
        'Sioux',
        'Spanish',
      ],
    },
    Leadership: { trait: 'Mien', concentrations: [] },
    "Lockpickin'": { trait: 'Deftness', concentrations: [] },
    'Mad Science': { trait: 'Knowledge', concentrations: [] },
    Medicine: {
      trait: 'Knowledge',
      concentrations: ['General', 'Surgery', 'Veterinary'],
    },
    Overawe: { trait: 'Mien', concentrations: [] },
    "Performin'": {
      trait: 'Mien',
      concentrations: [
        'Acting',
        'Dancing',
        'Fiddle',
        'Harmonica',
        'Juggling',
        'Legerdemain',
        'Singing',
      ],
    },
    Persuasion: { trait: 'Mien', concentrations: [] },
    Professional: {
      trait: 'Knowledge',
      concentrations: [
        'Journalism',
        'Law',
        'Military',
        'Photography',
        'Politics',
        'Theology',
      ],
    },
    'Quick Draw': {
      trait: 'Quickness',
      concentrations: ['Knife', 'Pistol', 'Rifle', 'Shotgun', 'Sword'],
    },
    Ridicule: { trait: 'Smarts', concentrations: [] },
    Ritual: { trait: 'Special', concentrations: [] },
    Science: {
      trait: 'Knowledge',
      concentrations: ['Biology', 'Chemistry', 'Engineering', 'Physics'],
    },
    Scrutinize: { trait: 'Cognition', concentrations: [] },
    Search: { trait: 'Cognition', concentrations: [], default: 1 },
    Spot: { trait: 'Cognition', concentrations: [] },
    "Scroungin'": { trait: 'Smarts', concentrations: [] },
    "Shootin'": {
      trait: 'Deftness',
      concentrations: [
        'Automatics',
        'Flamethrower',
        'Pistol',
        'Rifle',
        'Shotgun',
      ],
    },
    'Sleight of Hand': { trait: 'Deftness', concentrations: [] },
    Sneak: { trait: 'Nimbleness', concentrations: [], default: 1 },
    'Speed-Load': {
      trait: 'Deftness',
      concentrations: ['Pistol', 'Rifle', 'Shotgun'],
    },
    Streetwise: { trait: 'Smarts', concentrations: [] },
    Survival: {
      trait: 'Smarts',
      concentrations: ['Desert', 'Mountain', 'Swamp', 'Plains'],
    },
    "Swimmin'": { trait: 'Nimbleness', concentrations: [] },
    "Tale-Tellin'": { trait: 'Mien', concentrations: [] },
    Teamster: { trait: 'Nimbleness', concentrations: [] },
    "Throwin'": {
      trait: 'Deftness',
      concentrations: ['Balanced', 'Unbalanced'],
    },
    "Tinkerin'": { trait: 'Smarts', concentrations: [] },
    "Trackin'": { trait: 'Cognition', concentrations: [] },
    Trade: {
      trait: 'Knowledge',
      concentrations: [
        'Blacksmithing',
        'Carpentry',
        'Gunsmithing',
        'Mining',
        'Seamanship',
        'Telegraphy',
        'Undertaking',
      ],
    },
  },
};

export default dlcConfig;
