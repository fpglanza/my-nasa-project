const fs = require('fs');
const path = require('path');
const planets = require('./planets.mongo');

const { parse } = require('csv-parse');

// const habitablePlanets = [];

function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED'
        && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
        && planet['koi_prad'] < 1.6;
}

function habitablePlanetShow(planets) {
    planets.forEach(planet => {
        return planet.keplerName
    });
}

/*
const promise = new Promise((resolve, reject) => {
  resolve(42);
});
promise.then((result) => {
  use the result(in this case 42) in some way, with a function
});
const result = await promise;
console.log(result);
*/

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname,'..', '..', 'data', 'kepler_data.csv'))
      .pipe(parse({
        comment: '#',
        columns: true,
      }))
      .on('data', async (data) => {
        if (isHabitablePlanet(data)) {
          // upsert = update + insert
         savePlanet(data);
        }
      })
      .on('error', (err) => {
        console.log(err);
        reject(err);
      })
      .on('end', async () => {
        const countPlanetsFound = (await getAllPlanets()).length;
        console.log(`We have found: ${countPlanetsFound} habitable planets`);
        resolve();
      });
  });
}

async function getAllPlanets() {
  return await planets.find({}, {
    '_id': 0, '__v': 0,
  });
}

async function savePlanet(planet) {
  try {
    await planets.updateOne({
      keplerName: planet.keplerName,
    }, {
      keplerName: planet.keplerName,
    }, {
      upsert: true,
    });
  } catch(err) {
    console.error(`Could not save planet: ${err}`)
  }
}


module.exports = { 
  loadPlanetsData,
  getAllPlanets,
};