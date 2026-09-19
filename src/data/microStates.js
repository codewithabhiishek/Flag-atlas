import { byCode } from "./countries";

export const MICRO_STATE_COORDINATES = {
  ad: [1.5218, 42.5063], // Andorra
  li: [9.5209, 47.166], // Liechtenstein
  mt: [14.3754, 35.9375], // Malta
  mc: [7.4246, 43.7384], // Monaco
  sm: [12.4578, 43.9424], // San Marino
  va: [12.4534, 41.9029], // Vatican City
  bh: [50.5577, 26.0667], // Bahrain
  mv: [73.2207, 3.2028], // Maldives
  sg: [103.8198, 1.3521], // Singapore
  cv: [-23.6052, 16.0021], // Cabo Verde
  km: [43.8726, -11.8795], // Comoros
  mu: [57.5522, -20.3484], // Mauritius
  st: [6.6131, 0.1864], // Sao Tome and Principe
  sc: [55.492, -4.6796], // Seychelles
  ag: [-61.8468, 17.0608], // Antigua and Barbuda
  bb: [-59.5432, 13.1939], // Barbados
  dm: [-61.371, 15.415], // Dominica
  gd: [-61.679, 12.1165], // Grenada
  kn: [-62.783, 17.3578], // Saint Kitts and Nevis
  lc: [-60.9789, 13.9094], // Saint Lucia
  vc: [-61.2872, 13.2528], // Saint Vincent and the Grenadines
  ki: [-157.363, 1.8709], // Kiribati
  mh: [171.1845, 7.1315], // Marshall Islands
  fm: [158.156, 6.8874], // Micronesia
  nr: [166.9315, -0.5228], // Nauru
  pw: [134.5825, 7.515], // Palau
  ws: [-172.1046, -13.759], // Samoa
  to: [-175.1982, -21.1789], // Tonga
  tv: [179.194, -7.1095], // Tuvalu
};

export const MICRO_STATES = Object.entries(MICRO_STATE_COORDINATES).map(
  ([code, coordinates]) => {
    const country = byCode(code);
    return {
      code,
      coordinates,
      name: country?.name || code.toUpperCase(),
      region: country?.region || "",
      capital: country?.capital || "",
    };
  }
);
