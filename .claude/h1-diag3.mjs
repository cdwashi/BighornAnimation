import { join } from 'node:path';
import { pathToFileURL } from 'node:url'; // D91-dispatch portability: Windows ESM needs file:// URLs for absolute-path dynamic imports
const REPO=process.cwd(), /* D91-dispatch portability: original hardcoded /home/claude/BighornAnimation; run from repo root */ SCEN='little-bighorn-1876';
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO,'dist/src/terrain/movement-loader.js')).href);
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO,'data/terrain',SCEN));
const toLocal=(lat,lon)=>terrain.toLocal(lat,lon);
const [x,y]=toLocal(45.50935,-107.38010);
console.log('blocked midpoint local x,y =',Math.round(x),Math.round(y));
console.log('sample:',JSON.stringify(terrain.movementAtMeters(x,y)));
console.log('elevation:',terrain.elevationAtMeters(x,y));
console.log('\n9x9 movementFactor grid at 25 m spacing (row = +north):');
for(let dy=100;dy>=-100;dy-=25){
  let row='';
  for(let dx=-100;dx<=100;dx+=25){
    const s=terrain.movementAtMeters(x+dx,y+dy);
    row+= (s.movementFactor>0? s.movementFactor.toFixed(2):' 0.00')+`(${s.coverKind}) `;
  }
  console.log(String(dy).padStart(5),row);
}
