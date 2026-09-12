import { geoEqualEarth, geoPath } from "d3-geo";
import { feature } from "topojson-client";

/** Fit a d3 projection to a pixel extent (d3-geo v2 compatible). */
export function fitExtent(projection, extent, object) {
  const w = extent[1][0] - extent[0][0];
  const h = extent[1][1] - extent[0][1];
  const clip = projection.clipExtent?.();

  projection.scale(150).translate([0, 0]);

  const b = geoPath(projection).bounds(object);
  const k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1]));
  const x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2;
  const y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;

  projection.scale(k * projection.scale()).translate([x, y]);

  if (clip) projection.clipExtent(clip);
  return projection;
}

/**
 * Compute Equal Earth layout that fills available width and sizes the SVG
 * to the land bounds so unused vertical ocean is removed.
 *
 * react-simple-maps always translates to [width/2, height/2], so we convert
 * the fitted translate into a geographic `center` it can apply.
 */
export function computeWorldMapLayout(containerWidth, geoData, padding = 14) {
  if (!containerWidth || !geoData?.objects?.countries) return null;

  const countries = feature(geoData, geoData.objects.countries);
  const mapWidth = Math.max(280, Math.floor(containerWidth));

  const probe = geoEqualEarth();
  fitExtent(probe, [[0, 0], [mapWidth, mapWidth]], countries);
  const [[, y0], [, y1]] = geoPath(probe).bounds(countries);
  const mapHeight = Math.max(140, Math.ceil(y1 - y0 + padding * 2));

  const fitted = geoEqualEarth();
  fitExtent(
    fitted,
    [[padding, padding], [mapWidth - padding, mapHeight - padding]],
    countries,
  );

  const scale = fitted.scale();
  // rsm always translates to the SVG midpoint; set geographic center to
  // whatever land feature currently sits there in the fitted projection.
  const inverted = fitted.invert([mapWidth / 2, mapHeight / 2]);
  const center = inverted || [0, 0];

  return {
    width: mapWidth,
    height: mapHeight,
    scale,
    center,
  };
}
