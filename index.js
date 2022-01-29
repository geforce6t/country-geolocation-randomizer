import { randomUniform } from "d3-random";
import {geoContains, geoBounds} from "d3-geo";
import { readFile } from "fs/promises";
import fs from "fs";
import readline from "readline";

const countries = JSON.parse(await readFile(new URL('./countries.json', import.meta.url)));


function randomBoundingBoxCoordinates(boundingBox) {
  const randomLongitude = randomUniform(
    boundingBox[0][0],
    boundingBox[1][0] + 360 * (boundingBox[1][0] < boundingBox[0][0])
  )
  const randomLatitude = randomUniform(boundingBox[0][1], boundingBox[1][1])
  return () => [randomLongitude(), randomLatitude()]
}

function randomFeatureCoordinates(feature) {
  const featureBoundingBox = geoBounds(feature)
  const randomCoordinates = randomBoundingBoxCoordinates(featureBoundingBox)
  return () => {
    let p
    do {
      p = randomCoordinates()
    } while (!geoContains(feature, p))
    return p
  }
}

function countryFeature(countryName) {
    let name = countryName.trim();
    return countries.features.filter(f => String(f.properties.ADMIN).toLowerCase() === String(name).toLocaleLowerCase())[0]
}



// operational part

let country;
let number_of_points;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Name a country : (check countries.json file for country name)', (name) => {
    rl.question('How many points you want ? ', (number_of_points) => {
        country = name;
        number_of_points = number_of_points;


        const arr = [];

        for (let index = 0; index < number_of_points; index++) {
            const val = randomFeatureCoordinates(countryFeature(country))();
            arr.push({lng: val[0], lat: val[1]});
        }

        fs.writeFileSync("./output.json", JSON.stringify(arr, null, 4));
        rl.close();
    });
});


rl.on('close',() => {
  console.log('\nBYE BYE.. job done.. check the json file in the root dir');
  process.exit(0);
});
