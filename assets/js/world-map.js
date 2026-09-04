// Highlights visited countries on an amCharts 3 world map.
// The country list is injected at build time from data/hobbies/countries.json.
import * as params from '@params';

AmCharts.makeChart('mapdiv', {
  type: 'map',
  theme: 'dark',
  projection: 'mercator',
  panEventsEnabled: true,
  backgroundColor: '#535364',
  backgroundAlpha: 1,
  zoomControl: { zoomControlEnabled: true },
  dataProvider: {
    map: 'worldHigh',
    getAreasFromMap: true,
    areas: params.countries.map((id) => ({ id, showAsSelected: true })),
  },
  areasSettings: {
    autoZoom: true,
    color: '#B4B4B7',
    colorSolid: '#84ADE9',
    selectedColor: '#84ADE9',
    outlineColor: '#666666',
    rollOverColor: '#9EC2F7',
    rollOverOutlineColor: '#000000',
  },
});
