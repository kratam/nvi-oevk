const fetch = require('node-fetch')
const fs = require('fs').promises
const topojson = require('topojson')

async function start() {
  const data = await fetch(
    'https://www.valasztas.hu/hu/ogy2018/-/ogy-terkep/244',
  ).then((r) => r.json())
  const features = data.polygons
    .map((oevk) => {
      try {
        const polygon = JSON.parse(oevk.polygon.paths)
        return {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [polygon.map((p) => [p.lng, p.lat])],
          },
          properties: {
            ...oevk.tooltip,
            center: oevk.center,
            maz: oevk.maz,
            oevk: oevk.oevk,
          },
        }
      } catch (error) {
        console.error('unable to parse polygon', oevk.tooltip?.szekhely)
      }
    })
    .filter((v) => v)
    .filter((v) => Object.keys(v.properties).length)
  const geojson = {
    type: 'FeatureCollection',
    properties: { name: 'oevk' },
    features,
  }
  await fs.writeFile('oevk.geojson', JSON.stringify(geojson))
  console.log('Wrote oevk.geojson')
  const topo = topojson.topology([geojson])
  await fs.writeFile('oevk.topojson', JSON.stringify(topo))
  console.log('Wrote oevk.topojson')
}
start()
