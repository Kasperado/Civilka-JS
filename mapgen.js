// Poisson-disc Sampling
function generatePoissonDistribution(boxSize, minDistance, maxTries, boundaryOffset, points) {
  // Setup
  const w = minDistance / Math.sqrt(2);
  var cols, rows;
  const grid = [];
  var active = (points == null) ? [] : [...points];
  var ordered = (points == null) ? [] : [...points];
  let biggerDimension = (boxSize.width > boxSize.height) ? boxSize.width : boxSize.height;
  // STEP-0 - Grid for storing data and accelerating spatial searches
  cols = floor(boxSize.width / w); // Width
  rows = floor(boxSize.height / w); // Height
  for (let i = 0; i < cols * rows; i++) {
    grid[i] = undefined;
  }
  // Put given points into grid [OPTIONAL]
  for (var i = 0; i < active.length; i++) {
    let point = active[i];
    var col = floor(point.x / w);
    var row = floor(point.y / w);
    grid[col + row * cols] = point;
  }
  // STEP-1 - Select the initial candidate (prefer from middle)
  var x = (points == null) ? boxSize.width / 2 : boundaryOffset;
  var y = (points == null) ? boxSize.height / 2 : boundaryOffset;
  var i = floor(x / w);
  var j = floor(y / w);
  var pos = createVector(x, y);
  grid[i + j * cols] = pos;
  active.push(pos);
  // STEP-2 - Generate next points from initial candidate
  while (active.length > 0) {
        // Choose randomly active point
        var randIndex = floor(random(active.length));
        var pos = active[randIndex];
        var found = false; // Flag if next point was found
        // Try to put points near active one
        for (var n = 0; n < maxTries; n++) {
          var candidate = createVector(random(-1, 1), random(-1, 1)); // Random angle (random x and y between (-1,1))
          var m = random(minDistance, 2 * minDistance);
          candidate.setMag(m); // Moving in m direction
          candidate.add(pos); // Add position
          // Check if is in the grid
          var col = floor(candidate.x / w);
          var row = floor(candidate.y / w);
          let isInMapBoundaries = (col > -1 && row > -1 && col < cols && row < rows);
          let isTooCloseToBoundaries = (boundaryOffset <= candidate.x &&
                                        candidate.x <= boxSize.width - boundaryOffset &&
                                        boundaryOffset <= candidate.y &&
                                        candidate.y <= boxSize.height - boundaryOffset);
          if (isInMapBoundaries && isTooCloseToBoundaries && !grid[col + row * cols]) {
            var ok = true; // Flag, if any of neighboring grid cells
            for (var i = -1; i <= 1; i++) {
              for (var j = -1; j <= 1; j++) {
                // Get neighbor index
                var index = (col + i) + (row + j) * cols;
                // Check grid cell is occupied
                var neighbor = grid[index];
                if (neighbor) {
                  // Check if point is too close
                  var d = p5.Vector.dist(candidate, neighbor);
                  // Distance check
                  if (d < minDistance) {
                    ok = false;
                    break; // No need to check others
                  }
                }
              }
            }
            // Should be added to list?
            if (ok) {
              found = true;
              grid[col + row * cols] = candidate;
              active.push(candidate);
              ordered.push(candidate);
              break;
            }
          }
        }
        // Remove active point if next one wasn't found
        if (!found) active.splice(randIndex, 1);
    }
    // Return all the points
    return ordered;
}

function createLandmass() {
  let rpPos, polygonSize, randomPolygon;
  // Create
  rpPos = createVector(middlePos.x, middlePos.y);
  polygonSize = {
    w: mapSize.width*0.7,
    h: mapSize.height*0.6
  }
  randomPolygon = generateRandomPolygon(24, rpPos, polygonSize, 0.7, 0.1);
  randomPolygons.push(randomPolygon);
}

// Generate new polygon by creating points around center and them appling some jitter
function generateRandomPolygon(numberOfCorners, centerPos, polygonSize, pointJitter, angleJitter) {
  // Adjustment for futher calculations
  polygonSize.w /= 2;
  polygonSize.h /= 2;
  // Setup
  let angle = 0;
  let angleStep = (Math.PI * 2) / numberOfCorners;
  let randomPolyPoints = [];
  // Which dimension is bigger
  let isWidthBigger = (polygonSize.w > polygonSize.h);
  let biggerDimensionMultiplier;
  if (isWidthBigger) biggerDimensionMultiplier = (polygonSize.w / polygonSize.h);
  else biggerDimensionMultiplier = (polygonSize.h / polygonSize.w);
  let power = (isWidthBigger ? polygonSize.h : polygonSize.w);
  // Calculate Random Polygon Points
  for (let i = 0; i < numberOfCorners; i++) {
    let polyPoint = createVector(centerPos.x, centerPos.y);
    // Fake vector
    let minusPI = angle - Math.PI;
    let stregthPI = (Math.abs(minusPI) / Math.PI) - 0.5;
    let fakePos = createVector(centerPos.x, centerPos.y);
    fakePos.add(-power, -power);
    if (isWidthBigger) {
      let range = fakePos.x - centerPos.x;
      let increase = (range * biggerDimensionMultiplier) - range;
      let additionalRange = increase * stregthPI * 2;
      polyPoint.x += additionalRange;
    } else {
      let range = fakePos.y - centerPos.y;
      let increase = (range * biggerDimensionMultiplier) - range;
      let additionalRange = increase * stregthPI * 2;
      polyPoint.y += additionalRange;
    }
    // Angle jitter
    let trueAngle = angle + (angleJitter * random(-angleStep/2, angleStep/2));
    let angleToAdd;
    if (isWidthBigger) angleToAdd = createVector(Math.cos(trueAngle - Math.PI), Math.sin(trueAngle - Math.PI));
    else angleToAdd = createVector(Math.sin(trueAngle - Math.PI), Math.cos(trueAngle - Math.PI));
    // Move to desired location
    polyPoint.add(angleToAdd.x * power, angleToAdd.y * power);
    // Add point jitter
    let pja = pointJitter * power / 2;
    let jitterX = random(-pja, pja);
    let jitterY = random(-pja, pja);
    polyPoint.add(jitterX, jitterY);
    // Increase angle
    angle += angleStep;
    // Add to points array
    randomPolyPoints.push(polyPoint);
  }
  // Calculate Random Polygon Edges
  let randomPolyEdges = [];
  for (var i = 0; i < randomPolyPoints.length; i++) {
    let p = randomPolyPoints[i];
    let p2 = randomPolyPoints[i+1];
    let va = new Vertex(p.x, p.y);
    let vb;
    if (p2) vb = new Vertex(p2.x, p2.y);
    else vb = new Vertex(randomPolyPoints[0].x, randomPolyPoints[0].y);
    edge = new Edge();
    edge.va = va;
    edge.vb = vb;
    randomPolyEdges.push(edge);
  }
  // Return
  let randomPolygon = {
    points: randomPolyPoints,
    edges: randomPolyEdges
  }
  return randomPolygon;
}

// Assign type to the cell based on given data
function assignTypeToCells() {
  let landCells = [];
  let waterCells = [];
  let ci = 0;
  for (var i = 0; i < game.cells.length; i++) {
    let point = game.cells[i].site;
    let type = CellType.OCEAN;
    // Random Poly Islands
    for (var j = 0; j < randomPolygons.length; j++) {
      let rp = randomPolygons[j];
      if (inPoly(point, rp.edges)) {
        type = CellType.LAND;
        landCells.push(game.cells[i]);
        break; // We confirmed that this cell is on at least one land mass
      } else {
        waterCells.push(game.cells[i]);
      }
    }
    // Set type
    if (type != CellType.OCEAN) ci++;
    game.cells[i].type = type;
  }
  console.log("Number of land cells: " + ci);
  game.landCells = landCells;
  game.waterCells = waterCells;
}

function spawnNations(number, mDis, pLimit) {
  let nationsToSpawn = number;
  let nationsToSpawnCounter = nationsToSpawn;
  // Create wasteland for storing impassable terrain
  let nationwasteland = new Nation();
  nationwasteland.color = "#212121";
  game.wasteland = nationwasteland;
  // Populate wasteland
  for (let i = 0; i < game.provinces.length; i++) {
    const province = game.provinces[i];
    if (wastelandTest(province)) game.wasteland.addProvince(province);
  }
  // Spawn nations in random provinces
  while (nationsToSpawnCounter != 0) {
    let rn = floor(random(0, game.provinces.length - 1));
    let province = game.provinces[rn];
    // Checks
    if (province.owner != null) continue; // This province already has an owner
    // Check if it's not too close to other nation capital
    let isTooClose = false;
    let minDistance = mDis;
    for (var i = 0; i < game.nations.length; i++) {
      let nation = game.nations[i];
      let distance = dist(province.cell.site.x, province.cell.site.y, nation.capital.cell.site.x, nation.capital.cell.site.y);
      if (distance < minDistance) {
        isTooClose = true;
        break;
      }
    }
    if (isTooClose) continue;
    // Prefer possible elevation
    if (province.elevation == ElevationLevel.MOUNTAINS) continue;
    // Not polar, not desert
    if (province.temperature < 0.1 || province.temperature > 0.9) continue;
    // Create nation on this province
    let nation = new Nation();
    nation.color = getRandomHexColor();
    nation.capital = province;
    nation.addProvince(province);
    game.addNation(nation);
    nationsToSpawnCounter--;
  }
  // Populate nations with provinces
  for (let p = 0; p < (pLimit - 1); p++) {
    for (let i = 0; i < game.nations.length; i++) {
      game.nations[i].expand();
    }
  }
}

function wastelandTest(province) {
  // If province surrounded by mountains?
  let isSurrouded = true;
  let edges = province.cell.edges;
  let heightLimit = 20;
  // If one edge is open, then it's not
  for (let i = 0; i < edges.length; i++) {
    let edge = edges[i];
    if (edge.va.height < heightLimit && edge.vb.height < heightLimit) {
      isSurrouded = false;
      break;
    }
  }
  return isSurrouded;
}

function createGeography() {
  let coastVertex = [];
  for (var i = 0; i < game.vertices.length; i++) {
    let vertex = game.vertices[i];
    // Check cells to determine type
    let landCells = 0;
    let oceanCells = 0;
    for (var c = 0; c < vertex.cells.length; c++) {
      let cell = vertex.cells[c];
      if (cell.type == CellType.LAND) landCells++;
      else oceanCells++;
    }
    // Assign
    if (landCells == vertex.cells.length) {
      vertex.type = VertexType.LAND;
    } else if (oceanCells == vertex.cells.length) {
      vertex.type = VertexType.OCEAN;
    } else {
      vertex.type = VertexType.COAST;
      vertex.height = 0;
      coastVertex.push(vertex);
    }
  }
  // Assign height to Vertex
  while (coastVertex.length > 0) {
    let randIndex = floor(random(0, coastVertex.length - 1))
    let randVertex = coastVertex[randIndex];
    for (var n = 0; n < randVertex.neighbors.length; n++) {
      let neighbor = randVertex.neighbors[n];
      if (neighbor.type != VertexType.LAND) continue;
      if (neighbor.height != -1) continue; // Already set
      neighbor.height = (randVertex.height + 1);
      coastVertex.push(neighbor);
    }
    coastVertex.splice(randIndex, 1);
  }
  // Create rivers using vertex height data
  createRivers();
}

function createRivers() {
  // Add rivers
  for (var i = 0; i < game.vertices.length; i++) {
    let vertex = game.vertices[i];
    let rng = random(100);
    let heightMinimum = (vertex.height > 5);
    let rngResult = ((vertex.height / 5) > rng);
    if (heightMinimum && rngResult) {
      // Check if starting vertex is lying on other river vertices
      let overlaps = false;
      for (var j = 0; j < game.rivers.length; j++) {
        let river = game.rivers[j];
        for (var x = 0; x < river.vertices.length; x++) {
          let riverVertex = river.vertices[x];
          if (vertex.site.x == riverVertex.site.x && riverVertex.site.y == vertex.site.y) overlaps = true;
        }
      }
      if (overlaps) continue;
      let river = new River(vertex);
      river.init();
      game.rivers.push(river);
    }
  }
}

function createProvinces() {
  // Create provinces on land cells
  for (var i = 0; i < game.landCells.length; i++) {
    let newProvince = new Province(game.landCells[i]);
    game.provinces.push(newProvince);
  }
  // Transfer neighbors from cells to provinces
  for (var i = 0; i < game.provinces.length; i++) {
    let p = game.provinces[i];
    for (var j = 0; j < p.cell.neighbors.length; j++) {
      let neighborCell = p.cell.neighbors[j];
      if (neighborCell.type == CellType.LAND) p.neighbors.push(neighborCell.owner);
    }
  }
}

function assignGeography() {
  let halfHeight = mapSize.height / 2;
  for (let i = 0; i < game.provinces.length; i++) {
    let province = game.provinces[i];
    // ELEVATION  
    let cell = province.cell;
    let averageVertexHeight = 0;
    // Get average height surrouding this province
    for (var v = 0; v < cell.vertices.length; v++) {
      let vertex = cell.vertices[v];
      averageVertexHeight += vertex.height;
    }
    averageVertexHeight /= cell.vertices.length;
    // Assign right level of elevation to the province
    let level = ElevationLevel.IMPASSABLE;
    if (averageVertexHeight < 5) level = ElevationLevel.PLAINS;
    else if (averageVertexHeight < 10) level = ElevationLevel.HILLS;
    else if (averageVertexHeight < 15) level = ElevationLevel.HIGHLANDS;
    else if (averageVertexHeight < 20) level = ElevationLevel.MOUNTAINS;
    province.elevation = level;
    // TEMPERATURE
    // Depends on where the  province is in vertical place
    let py = province.cell.site.y;
    let amount;
    if (py > halfHeight) amount = 1 - ((py / halfHeight) - 1);
    else amount = (py / halfHeight);
    province.temperature = parseFloat(amount).toFixed(3);
    // HUMIDITY
    let humidityVal = 0;
    // Water body 80%
    for (let j = 0; j < province.cell.neighbors.length; j++) {
      let neighbor = province.cell.neighbors[j];
      if (neighbor.type == CellType.OCEAN) {
        humidityVal += 0.8;
        break;
      }
    }
    // River 20%
    let riverNumber = 0;
    for (let j = 0; j < province.cell.edges.length; j++) {
      let edge = province.cell.edges[j];
      if (edge.isRiver) {
        riverNumber++;
        break;
      }
    }
    humidityVal += 0.2*(riverNumber/province.cell.edges.length);
    // Temperature inflence
    humidityVal = (humidityVal/2) + (humidityVal*province.temperature)/2;
    if (humidityVal > 1) humidityVal = 1;
    province.humidity = parseFloat(humidityVal).toFixed(3);;
  }
}
