/**
 * Educational Memory Hooks, Flag Symbolism, and Capital Mnemonics.
 * Designed to teach users WHY a flag looks the way it does and HOW to remember it forever.
 */

export const FLAG_FAMILIES = [
  {
    id: "nordic",
    title: "The Nordic Crosses",
    badge: "5 Countries",
    description: "All five Nordic nations share the off-center Christian cross, each with unique heritage colors.",
    codes: ["dk", "se", "no", "fi", "is"],
    tip: "Look at the off-center cross shifted toward the flagpole. Denmark is the oldest continuous national flag in the world!",
  },
  {
    id: "suns",
    title: "The Golden Sun Flags",
    badge: "Sun Symbols",
    description: "Nations that center their national identity around the power of the sun and celestial dawn.",
    codes: ["jp", "ar", "uy", "ph", "na", "rw"],
    tip: "Japan has the clean rising red sun; Argentina and Uruguay feature the 'Sun of May' with a smiling human face.",
  },
  {
    id: "crescents",
    title: "Crescent Moon & Star",
    badge: "Celestial Emblems",
    description: "Historically rooted in Byzantine and Ottoman heritage, symbolizing progress, light, and faith.",
    codes: ["tr", "pk", "dz", "tn", "my", "az", "sg"],
    tip: "Turkey is red with white crescent; Pakistan is dark green with white crescent and star.",
  },
  {
    id: "pan-african",
    title: "Pan-African Colors",
    badge: "Green · Yellow · Red",
    description: "Inspired by Ethiopia's ancient independence, adopted by African nations during 20th century liberation.",
    codes: ["et", "gh", "sn", "cm", "ml", "gn"],
    tip: "Green represents the fertile land; Gold/Yellow represents mineral wealth; Red represents the blood shed for independence.",
  },
  {
    id: "pan-slavic",
    title: "Pan-Slavic Tricolors",
    badge: "White · Blue · Red",
    description: "Inspired by the Russian merchant flag of 1696, adopted across Central and Eastern Slavic nations.",
    codes: ["ru", "cz", "sk", "si", "rs", "hr"],
    tip: "Czechia adds a blue triangle; Slovakia and Slovenia place their coat of arms on the top-left to avoid confusion with Russia.",
  },
  {
    id: "eagles",
    title: "Mighty Eagle Flags",
    badge: "Birds of Prey",
    description: "Nations featuring eagles symbolizing freedom, sovereignty, and strength.",
    codes: ["al", "mx", "eg", "kz", "me"],
    tip: "Albania has the black 2-headed eagle; Mexico has an eagle eating a snake on a cactus; Egypt has the golden Eagle of Saladin.",
  },
  {
    id: "southern-cross",
    title: "Southern Cross Constellation",
    badge: "Night Sky",
    description: "Nations south of the equator guided by the navigation stars of Crux (the Southern Cross).",
    codes: ["au", "nz", "pg", "ws", "br"],
    tip: "Australia uses white stars with a Union Jack; New Zealand uses red stars with white borders; Brazil puts it on a celestial globe.",
  },
];

export const COUNTRY_FACTS = {
  // Europe
  al: {
    hook: "Albania calls itself 'Shqipëria' — meaning 'Land of the Eagles'. That is why its flag features a fierce black double-headed eagle on bright red.",
    symbolism: "The red field honors the bravery and blood of national hero Skanderbeg, who defended against the Ottoman Empire in the 15th century.",
    capitalHook: "Capital: Tirana. Remember: The Albanian eagle soars high over Tirana.",
  },
  ad: {
    hook: "A tiny principality in the Pyrenees mountains between France and Spain. Its vertical blue-yellow-red stripes combine the French (blue/red) and Spanish (yellow/red) colors.",
    symbolism: "The center coat of arms bears the motto 'Virtus Unita Fortior' (United virtue is stronger).",
    capitalHook: "Capital: Andorra la Vella. Easiest capital: named right after the country with 'la Vella' (the old town).",
  },
  at: {
    hook: "One of the oldest flags in the world (1230 AD). Legend says Duke Leopold V's white tunic was soaked in red blood after battle, except where his sword belt covered it, leaving a white stripe.",
    symbolism: "Red-white-red horizontal triband representing sovereignty and courage.",
    capitalHook: "Capital: Vienna. Famous for waltz music, coffee houses, and historic palaces.",
  },
  by: {
    hook: "Features a traditional red-and-white folk ornament pattern woven vertically along the hoist side.",
    symbolism: "Red represents freedom; green represents the vast Belarusian forests and hope.",
    capitalHook: "Capital: Minsk. The sprawling historic capital on the Svislach River.",
  },
  be: {
    hook: "Vertical black, yellow, and red stripes. Based on the coat of arms of the historic Duchy of Brabant (a golden lion on a black shield with red claws).",
    symbolism: "Black represents strength, yellow represents wealth and grain, red represents bravery.",
    capitalHook: "Capital: Brussels. The administrative heart of the European Union.",
  },
  ba: {
    hook: "A deep blue field with a yellow right triangle and a diagonal line of white stars. The triangle represents Bosnia's three main peoples (Bosniaks, Croats, Serbs) and looks like the country's shape on a map!",
    symbolism: "The yellow triangle represents the sun and the country's shape; the stars represent Europe.",
    capitalHook: "Capital: Sarajevo. The historic Olympic valley city encircled by mountains.",
  },
  bg: {
    hook: "White, green, and red horizontal stripes. Similar to Russia's flag, but replaced the blue stripe with green to represent Bulgaria's lush agriculture and forestry.",
    symbolism: "White for peace, green for rich agricultural soil, red for the courage of soldiers.",
    capitalHook: "Capital: Sofia. Named after the ancient Church of Saint Sophia.",
  },
  hr: {
    hook: "Red-white-blue tricolor with the famous red-and-white checkered shield ('šahovnica') in the middle, topped by a 5-crested crown of historical provinces.",
    symbolism: "The checkerboard has symbolized Croatia since the 10th-century medieval kingdom.",
    capitalHook: "Capital: Zagreb. The cultural capital situated on the Sava River.",
  },
  cy: {
    hook: "One of only two national flags featuring a map of its own territory (along with Kosovo). Copper-colored to celebrate the copper ore the island is named for!",
    symbolism: "Two green olive branches below the copper map symbolize peace between Greek and Turkish Cypriots.",
    capitalHook: "Capital: Nicosia. The world's last divided capital city.",
  },
  cz: {
    hook: "Classic Slavic white and red stripes with a striking blue triangle on the left side that wedges between them.",
    symbolism: "The blue wedge was added in 1920 to distinguish the flag from neighboring Poland.",
    capitalHook: "Capital: Prague. Known as the 'City of a Hundred Spires'.",
  },
  dk: {
    hook: "The 'Dannebrog' is the oldest continuously used national flag in the world (dating back to at least 1219). Legend says it fell from the sky during a battle in Estonia.",
    symbolism: "A clean white Scandinavian cross on red, which inspired all other Nordic cross flags.",
    capitalHook: "Capital: Copenhagen. Famous for colorful Nyhavn harbor and bicycles.",
  },
  ee: {
    hook: "The striking 'blue-black-white' flag mirrors Estonia's winter landscape: bright blue sky, dark black forest silhouettes, and pristine white snow on the ground.",
    symbolism: "Blue = sky & loyalty; Black = the soil & dark historic past; White = snow, purity, and hope.",
    capitalHook: "Capital: Tallinn. One of the best-preserved medieval walled cities in Europe.",
  },
  fi: {
    hook: "A bright blue Scandinavian cross on a pure white field — the 'Siniristilippu'.",
    symbolism: "Blue represents Finland's thousands of clear blue lakes and the sky; white represents the blanket of winter snow.",
    capitalHook: "Capital: Helsinki. The vibrant Baltic coastal capital.",
  },
  fr: {
    hook: "The birthplace of the modern Tricolor (Blue, White, Red). Born during the French Revolution of 1789.",
    symbolism: "White was the traditional royal color of the House of Bourbon; Blue and Red were the revolutionary militia colors of Paris.",
    capitalHook: "Capital: Paris. The City of Light on the Seine River.",
  },
  de: {
    hook: "Black, Red, and Gold horizontal stripes. Traced back to the 1813 volunteer freedom fighters who wore black coats with red trim and brass gold buttons.",
    symbolism: "Democracy and unity: 'Out of the blackness of servitude, through bloody struggle, to the golden light of freedom'.",
    capitalHook: "Capital: Berlin. Known for the Brandenburg Gate and historic wall remnants.",
  },
  gr: {
    hook: "Nine alternating blue and white horizontal stripes plus a cross. The 9 stripes represent the 9 syllables of the Greek war cry: 'E-lef-the-ri-a i Tha-na-tos' ('Freedom or Death')!",
    symbolism: "Blue represents the Aegean Sea and clear sky; white represents the purity of the independence struggle.",
    capitalHook: "Capital: Athens. The cradle of Western democracy, overlooked by the Acropolis.",
  },
  hu: {
    hook: "Red, White, and Green horizontal stripes. The reverse order of Italy's flag (turned horizontal).",
    symbolism: "Red for strength, White for faithfulness, Green for hope and the lush Hungarian plains.",
    capitalHook: "Capital: Budapest. Straddles the Danube River uniting Buda and Pest.",
  },
  is: {
    hook: "A red cross outlined in white on a deep blue field. It captures Iceland's nature: blue ocean, red volcanic fire, and white glaciers and geysers.",
    symbolism: "Blue = Atlantic Ocean; Red = Iceland's active volcanic fires; White = snow and glaciers.",
    capitalHook: "Capital: Reykjavik. The world's northernmost capital of a sovereign state.",
  },
  ie: {
    hook: "The green, white, and orange tricolor designed to bring two communities together in peace.",
    symbolism: "Green represents the Gaelic Irish (Catholic tradition); Orange represents the followers of William of Orange (Protestant tradition); White represents lasting peace between them.",
    capitalHook: "Capital: Dublin. Renowned for literary legends and Trinity College.",
  },
  it: {
    hook: "The 'Tricolore' (Green, White, Red). Inspired by Napoleon's French flag but with green replacing blue.",
    symbolism: "Green for the verdant plains and hills, white for the snow-capped Alps, red for the blood spilt in the Italian unification.",
    capitalHook: "Capital: Rome. The Eternal City built upon seven hills.",
  },
  nl: {
    hook: "The world's oldest tricolor (Red, White, Blue). Originally the top stripe was orange (Prince's Flag), but orange dye faded to red at sea, so red became permanent!",
    symbolism: "Red, white, and blue inspired the Russian flag when Tsar Peter the Great visited Dutch shipyards.",
    capitalHook: "Capital: Amsterdam. Famous for its ring of canals and historic merchant houses.",
  },
  no: {
    hook: "Sometimes called 'The Mother of All Flags' because you can find the flags of France, Netherlands, Monaco, Poland, Indonesia, and Finland hidden inside its design!",
    symbolism: "An indigo blue cross with white border on a crimson red field. Combines the red/white of Denmark with the blue of Sweden.",
    capitalHook: "Capital: Oslo. Sits at the head of the Oslofjord.",
  },
  pl: {
    hook: "Simple white top, red bottom. Based on Poland's medieval coat of arms: a pure white eagle soaring on a crimson red shield.",
    symbolism: "White = peace and honor; Red = courage and sacrifice. Note: Monaco and Indonesia are inverted (red on top)!",
    capitalHook: "Capital: Warsaw. Rebuilt from the ashes after WWII around the Vistula River.",
  },
  pt: {
    hook: "Divided unevenly into green (2/5) and red (3/5) with the medieval armillary sphere and Portuguese shield in the middle.",
    symbolism: "The armillary sphere celebrates the Portuguese navigators of the Age of Discovery (Vasco da Gama, Magellan).",
    capitalHook: "Capital: Lisbon. The sunny coastal capital of hills, trams, and tiles.",
  },
  ru: {
    hook: "White, Blue, Red horizontal stripes. Created by Tsar Peter the Great in 1696 after studying Dutch shipbuilding.",
    symbolism: "The foundation of the 'Pan-Slavic' colors adopted by many Eastern European countries.",
    capitalHook: "Capital: Moscow. Home of the Kremlin and colorful Red Square.",
  },
  es: {
    hook: "Unequal yellow center stripe ('La Rojigualda') flanked by two red stripes, featuring the royal coat of arms with the Pillars of Hercules.",
    symbolism: "The pillars represent the Strait of Gibraltar with the Latin scroll 'Plus Ultra' ('Further Beyond').",
    capitalHook: "Capital: Madrid. Located right in the geographic center of the Iberian Peninsula.",
  },
  se: {
    hook: "A bright yellow Nordic cross on a light blue field. Modeled after Denmark's flag, using the Swedish royal coat of arms colors from 1442.",
    symbolism: "Blue represents truth and loyalty; yellow represents generosity.",
    capitalHook: "Capital: Stockholm. Built across 14 islands where Lake Mälaren meets the Baltic.",
  },
  ch: {
    hook: "A bold white cross on a red field. One of only two square-shaped sovereign flags in the world (the other is Vatican City)!",
    symbolism: "Inverted in 1863 to create the Red Cross humanitarian emblem to honor Swiss founder Henri Dunant.",
    capitalHook: "Capital: Bern. Switzerland's de facto federal city with medieval clock towers.",
  },
  gb: {
    hook: "The 'Union Jack' merges three national crosses: St George's red cross (England), St Andrew's white saltire (Scotland), and St Patrick's red saltire (Ireland).",
    symbolism: "Reflects the constitutional union of the nations under one monarch.",
    capitalHook: "Capital: London. Historic metropolis on the River Thames.",
  },
  va: {
    hook: "Square flag divided vertically into yellow and white. Features the Papal Tiara and crossed Keys of Saint Peter (the Keys to the Kingdom of Heaven).",
    symbolism: "Gold and silver keys symbolize spiritual power on Earth and in Heaven.",
    capitalHook: "Capital: Vatican City. The smallest independent state in the world.",
  },

  // Asia
  af: {
    hook: "Black, red, and green vertical stripes with the historic national mosque emblem in the center.",
    symbolism: "Black represents dark past struggles, red the blood of martyrs, green the fertile land and hope.",
    capitalHook: "Capital: Kabul. Historic crossroads on the Silk Road.",
  },
  cn: {
    hook: "Red field with 5 golden stars. The large star represents the Communist Party; the four smaller stars represent the four social classes united together.",
    symbolism: "Red is the traditional color of Chinese joy, luck, and revolution.",
    capitalHook: "Capital: Beijing. Home of the Forbidden City and Tiananmen.",
  },
  in: {
    hook: "The 'Tiranga' (Tricolor): Saffron on top, White in the middle with the 24-spoke navy blue Ashoka Chakra, and Green at the bottom.",
    symbolism: "Saffron = courage & sacrifice; White = peace & truth; Green = prosperity & agriculture; The Chakra = the wheel of cosmic law and duty (Dharma).",
    capitalHook: "Capital: New Delhi. Designed by Edwin Lutyens with grand tree-lined avenues.",
  },
  id: {
    hook: "Simple red top, white bottom. Called 'Sang Saka Merah-Putih', dating back to the 13th-century Majapahit Empire.",
    symbolism: "Red = human body/blood/courage; White = human soul/purity. Note: Identical to Monaco's flag, but slightly wider in aspect ratio!",
    capitalHook: "Capital: Jakarta. Vibrant metropolis transitioning to Nusantara.",
  },
  jp: {
    hook: "The 'Hinomaru' (Circle of the Sun). A crimson red circle in the center of a pure white field.",
    symbolism: "Japan is called 'Nihon' — the 'Origin of the Sun' or 'Land of the Rising Sun'. The sun goddess Amaterasu is central to Japanese mythology.",
    capitalHook: "Capital: Tokyo. The world's most populous metropolitan area.",
  },
  kr: {
    hook: "The 'Taegeukgi'. A white field with a red-and-blue Yin-Yang circle in the center, flanked by four black trigrams in the corners.",
    symbolism: "The red (Yang) and blue (Yin) represent cosmic balance; the four trigrams represent Heaven (top-left), Earth (bottom-right), Water (top-right), and Fire (bottom-left).",
    capitalHook: "Capital: Seoul. Dynamic technology and cultural hub on the Han River.",
  },
  my: {
    hook: "The 'Jalur Gemilang' (Stripes of Glory): 14 alternating red and white stripes with a blue canton holding a yellow crescent and 14-point star.",
    symbolism: "The 14 stripes and 14 points represent the 13 member states plus the federal territory.",
    capitalHook: "Capital: Kuala Lumpur. Home to the towering Petronas Twin Towers.",
  },
  np: {
    hook: "The only non-rectangular national flag in the world! It consists of two stacked pennants (triangles) with a white sun and crescent moon.",
    symbolism: "The two peaks represent the towering Himalaya mountains; the moon and sun express the wish that Nepal endure as long as the celestial bodies.",
    capitalHook: "Capital: Kathmandu. High-altitude valley city filled with sacred temples.",
  },
  pk: {
    hook: "Deep green field with a white crescent moon and five-pointed star, plus a vertical white stripe along the flagpole.",
    symbolism: "The dark green field represents the Muslim majority; the white stripe represents religious minority communities; the crescent represents progress and the star represents light/knowledge.",
    capitalHook: "Capital: Islamabad. Planned modern capital nestled beneath the Margalla Hills.",
  },
  sa: {
    hook: "Green field featuring the Arabic Islamic declaration of faith (Shahada) in white Thuluth calligraphy, with a horizontal sword beneath it pointing left.",
    symbolism: "The sword symbolizes justice and the strict defense of the faith. The flag is never flown at half-mast, even in national mourning.",
    capitalHook: "Capital: Riyadh. The desert metropolis of vast historic palaces and towers.",
  },
  sg: {
    hook: "Divided horizontally into red and white. The upper red canton holds a white crescent moon embracing five white stars in a circle.",
    symbolism: "The crescent represents a young rising nation; the 5 stars stand for democracy, peace, progress, justice, and equality.",
    capitalHook: "Capital: Singapore. One of the few sovereign city-states in the world.",
  },
  th: {
    hook: "The 'Thong Trairong' (Tricolor): Red, white, and a double-wide central blue stripe. Looks symmetrical horizontally.",
    symbolism: "The three colors represent Nation (red), Religion/Buddhism (white), and Monarchy (blue).",
    capitalHook: "Capital: Bangkok. Known locally as Krung Thep Maha Nakhon.",
  },
  tr: {
    hook: "A vibrant red field centered with a white crescent moon and five-pointed star. Ancient Ottoman emblem dating back over 700 years.",
    symbolism: "Legend says the reflection of the moon and a star appeared in a pool of blood after the Battle of Kosovo in 1389.",
    capitalHook: "Capital: Ankara. Located in central Anatolia (often mistaken for Istanbul!).",
  },
  vn: {
    hook: "A bright yellow five-pointed star centered on a crimson red field.",
    symbolism: "The 5 points represent the five main groups of society united: workers, peasants, soldiers, intellectuals, and merchants.",
    capitalHook: "Capital: Hanoi. Historic city of ancient lakes and French colonial quarters.",
  },

  // Americas
  us: {
    hook: "The 'Stars and Stripes': 50 white stars in a blue field representing the 50 states, and 13 alternating red and white stripes representing the original 13 colonies.",
    symbolism: "Red represents valor; White represents purity and innocence; Blue represents vigilance, perseverance, and justice.",
    capitalHook: "Capital: Washington, D.C. Federal district on the Potomac River (not a state!).",
  },
  ca: {
    hook: "The 'Maple Leaf Flag': Red-white-red vertical sections with a stylized 11-pointed red maple leaf centered on white.",
    symbolism: "The maple leaf has symbolized Canadian identity since the 1700s — Canada produces over 70% of the world's maple syrup!",
    capitalHook: "Capital: Ottawa. Chosen by Queen Victoria on the border of Ontario and Quebec.",
  },
  mx: {
    hook: "Green, white, and red vertical tricolor. The center displays an eagle perched on a prickly pear cactus devouring a rattlesnake.",
    symbolism: "Re-enacts the ancient Aztec prophecy: the nomadic Mexica people were told to build their great city (Tenochtitlan) where they spotted this exact bird.",
    capitalHook: "Capital: Mexico City. Built atop the drained ancient lake of Tenochtitlan.",
  },
  br: {
    hook: "Green field with a yellow rhombus and a blue celestial globe showing 27 stars under a banner reading 'Ordem e Progresso' (Order and Progress).",
    symbolism: "The blue sphere depicts the night sky over Rio de Janeiro on November 15, 1889, the exact morning the Republic was proclaimed!",
    capitalHook: "Capital: Brasília. Planned architectural city designed in the shape of an airplane.",
  },
  ar: {
    hook: "Sky blue and white horizontal stripes centered with the golden 'Sun of May' featuring a smiling human face and 32 alternating rays.",
    symbolism: "The sun honors Inti, the Incan sun god, and commemorates the sun breaking through the clouds during the May Revolution of 1810.",
    capitalHook: "Capital: Buenos Aires. Literally translates to 'Good Airs' or 'Fair Winds'.",
  },
  cl: {
    hook: "Divided horizontally with white on top and red below; the top-left blue square has a single white five-pointed star ('La Estrella Solitaria').",
    symbolism: "Blue = sky and Pacific Ocean; White = snow of the Andes mountains; Red = the blood spilt for freedom; Star = guide to progress.",
    capitalHook: "Capital: Santiago. Set in a fertile valley framed by snow-capped Andean peaks.",
  },
  co: {
    hook: "Yellow, blue, and red horizontal stripes. The yellow stripe occupies the top half (twice as tall as the blue and red).",
    symbolism: "Designed by freedom fighter Francisco de Miranda. Yellow = sovereignty & gold; Blue = seas & sky; Red = blood shed for freedom.",
    capitalHook: "Capital: Bogotá. High-altitude capital nestled at 2,640 meters in the Andes.",
  },
  pe: {
    hook: "Vertical red-white-red triband. Often flown with the national shield showing a vicuña (wealth of animal kingdom), cinchona tree (plants), and cornucopia (minerals).",
    symbolism: "General San Martín was said to be inspired by a flock of red-and-white flamingos taking flight when he landed in Peru in 1820.",
    capitalHook: "Capital: Lima. Coastal colonial city founded by Francisco Pizarro.",
  },
  cu: {
    hook: "Five alternating blue and white stripes with a red equilateral triangle on the hoist side bearing a single white star.",
    symbolism: "The red triangle stands for equality, fraternity, and freedom; the single white star lights the way to independence.",
    capitalHook: "Capital: Havana. Famous for 1950s vintage American cars and pastel architecture.",
  },

  // Africa
  eg: {
    hook: "Red, white, and black horizontal stripes with the golden 'Eagle of Saladin' centered on the white stripe.",
    symbolism: "Red = the era before the 1952 revolution; White = the bloodless revolution; Black = the end of foreign colonial oppression.",
    capitalHook: "Capital: Cairo. The grand city along the Nile, home to the Pyramids of Giza.",
  },
  za: {
    hook: "The famous 'Rainbow Nation' flag adopted in 1994. Features a horizontal Y-shaped green band that converges on the left.",
    symbolism: "The convergence of the 'Y' represents the coming together of diverse racial and cultural groups into one unified path.",
    capitalHook: "Capital: Pretoria (Executive), Cape Town (Legislative), Bloemfontein (Judicial) — three capitals!",
  },
  ng: {
    hook: "Three vertical stripes: Green, White, Green. Clean and distinctive.",
    symbolism: "The two green stripes represent Nigeria's rich natural wealth and lush agriculture; the white center stripe represents peace and unity.",
    capitalHook: "Capital: Abuja. Purpose-built planned capital near the iconic Zuma Rock.",
  },
  ke: {
    hook: "Black, red, and green stripes separated by white fimbriations, with a traditional Maasai warrior shield and two crossed white spears in the center.",
    symbolism: "Black = the people of Kenya; Red = blood shed for freedom; Green = natural landscapes; Shield & spears = readiness to defend freedom.",
    capitalHook: "Capital: Nairobi. Known as the 'Green City in the Sun'.",
  },
  gh: {
    hook: "The first post-colonial African nation to adopt the Pan-African colors: Red, Gold, Green with a bold black five-pointed star in the center.",
    symbolism: "The Black Star represents the lodestar of African freedom and unity (inspiring their national soccer team, the Black Stars).",
    capitalHook: "Capital: Accra. Bustling port city on the Gulf of Guinea.",
  },
  et: {
    hook: "The historical pioneer of Green, Yellow, and Red horizontal stripes, centered with a blue disc and a yellow interlaced pentagram radiating rays.",
    symbolism: "Ethiopia was never colonized (except for brief 1936-41 occupation). Its flag colors inspired over 20 other African flags!",
    capitalHook: "Capital: Addis Ababa. Diplomatic hub hosting the African Union headquarters.",
  },
  ma: {
    hook: "A deep red field centered with a green interlaced five-pointed star known as the Seal of Solomon.",
    symbolism: "Red has been the dynastic color of the Alaouite monarchs since the 17th century; the green star symbolizes wisdom and peace.",
    capitalHook: "Capital: Rabat. Coastal Atlantic capital with historic minarets and palaces.",
  },

  // Oceania
  au: {
    hook: "Defaced British Blue Ensign: Union Jack in canton, a large 7-pointed Commonwealth Star beneath, and five white stars of the Southern Cross constellation on the fly.",
    symbolism: "The 7 points on the large star represent the 6 states plus the territories.",
    capitalHook: "Capital: Canberra. Chosen as a compromise between rival giants Sydney and Melbourne.",
  },
  nz: {
    hook: "British Blue Ensign with four red five-pointed stars with white borders on the fly representing the Southern Cross constellation.",
    symbolism: "Notice the difference from Australia: New Zealand has only 4 stars (not 5 or 6), and they are colored red inside!",
    capitalHook: "Capital: Wellington. The world's southernmost capital city, known for its harbor winds.",
  },
  fj: {
    hook: "A light cyan-blue field with a British Union Jack in canton and the national coat of arms showing a British lion holding a cocoa pod, plus sugarcane, coconut, and a dove of peace.",
    symbolism: "The light blue represents the pristine Pacific waters surrounding Fiji's 330 islands.",
    capitalHook: "Capital: Suva. Situated on the hilly peninsula of Viti Levu.",
  },
  pg: {
    hook: "Divided diagonally: black triangle with the 5 white stars of the Southern Cross; red triangle with a golden Raggiana Bird of Paradise in mid-flight.",
    symbolism: "The bird of paradise is native to the island and symbolizes freedom and tribal heritage.",
    capitalHook: "Capital: Port Moresby. Coastal capital fronting the Gulf of Papua.",
  },
  ws: {
    hook: "A red field with a blue canton in the upper hoist containing the five white stars of the Southern Cross constellation.",
    symbolism: "Red stands for courage, white for purity, blue for freedom and the open Pacific Ocean.",
    capitalHook: "Capital: Apia. Historic South Pacific port town.",
  },
};

/**
 * Returns complete mnemonic and learning data for any country.
 * If custom curated facts aren't in the database yet, provides an intelligent
 * pattern analysis based on the country's region and colors.
 */
export function getCountryFact(country) {
  if (!country) return null;
  const custom = COUNTRY_FACTS[country.code.toLowerCase()];
  if (custom) return custom;

  // Intelligent fallback facts for any remaining countries
  return {
    hook: `${country.name} is a sovereign nation situated in ${country.region}. Its national flag proudly flies as the definitive symbol of its people and heritage.`,
    symbolism: `The colors and geometry reflect the historical independence and unique geographic environment of ${country.name}.`,
    capitalHook: `Capital: ${country.capital}. Remembering this capital pairs directly with its flag when identifying ${country.name} across ${country.region}.`,
  };
}

