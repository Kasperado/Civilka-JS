var game = new Game();
var middlePos;
var voronoi = new Voronoi();
var diagram;
// Generate
let randomPolygons = [];
// Mouse position
var mousePos;
let path = [];
let pathfindingStartCell;
let cellsToSearch;
// User chooses what to render
let optionDrawCells = true;
let optionDrawGeography = false;
let optionDrawRivers = true;
let optionDrawConnections = false;
let optionDrawWasteland = false;
let optionDrawNations = false;
let optionDrawPolygons = false;
let optionDrawHeight = false;
var allConnections;

onmousemove = function(e){
    mousePos = {
      x: e.clientX,
      y: e.clientY
    };
    // Update current cell mouse is in
    for (let i = 0; i < game.cells.length; i++) {
      let c = game.cells[i];
      let isInCell = c.isPointIn(mousePos);
      if (isInCell) {
        mouseCell = c;
        break;
      } else {
        mouseCell = null;
      }
    }
    // Update path
    if (mouseCell && pathfindingStartCell) path = aStarPathfinding(cellsToSearch, pathfindingStartCell, mouseCell);
}

onmousedown = function(e) {
  if (mouseCell) {
    // Same cell selected = disable pathfinding by setting pathfindingStartCell to null
    if (mouseCell?.id == pathfindingStartCell?.id) {
      pathfindingStartCell = null;
      return;
    }
    pathfindingStartCell = mouseCell;
    cellsToSearch = (pathfindingStartCell.type == CellType.OCEAN) ? game.waterCells : game.landCells;
    if (mouseCell && pathfindingStartCell) path = aStarPathfinding(cellsToSearch, pathfindingStartCell, mouseCell);
  } 
}
var mouseCell = null;
const mapSize = {
  width: 1200,
  height: 800
};
var selectedCell;
// Storage
var canvasElement;
var context;
var cellsRender;

function setup() {
    // Performace
    let startTime = performance.now();
    // Setup
    createCanvas(mapSize.width, mapSize.height);
    middlePos = createVector(mapSize.width/2, mapSize.height/2);
    canvasElement = document.querySelector('#defaultCanvas0');
    context = canvasElement.getContext('2d');
    let seed = floor(random(10000));
    randomSeed(seed);
    console.log("Seed used: " + seed);
    // Poisson-disc Sampling
    const minDistance = 20;
    const maxTries = 20;
    const boundaryOffset = minDistance/2;
    let points = generatePoissonDistribution(mapSize, minDistance, maxTries, boundaryOffset);
    // Voronoi diagram
    var bbox = {xl: 0, xr: width, yt: 0, yb: height};
    diagram = voronoi.compute(points, bbox);
    // Transfer data from voronoi to game
    transferData();
    // Random Polygon Islands
    createLandmass();
    // Give type to Cells
    assignTypeToCells();
    // Create provinces from land cells
    createProvinces(game.landCells);
    createGeography();
    assignGeography();
    // Spawn nations in random provinces
    spawnNations(10, minDistance*2, 10);
    // Render to store
    updateRender();
    // Load default options
    loadDefaultOptions();
    // Performace
    let endTime = performance.now()
    console.log(`Generation and inital render took ${floor(endTime - startTime)} milliseconds`);
}

function updateRender() {
  // Reset background
  background(255);
  // Render options
  drawCells(); // Special case, resolved in Cell.render()
  if (optionDrawGeography) drawGeography();
  if (optionDrawWasteland) drawWasteland();
  if (optionDrawNations) drawNations();
  if (optionDrawRivers) drawRivers();
  if (optionDrawConnections) drawConnections();
  if (optionDrawPolygons) drawPolygons();
  if (optionDrawHeight) drawHeight();
  // Store render for later
  cellsRender = context.getImageData(0, 0, canvasElement.width, canvasElement.height);
  // Reset
  game.needRenderUpdate = false;
}

function draw() {
  background(0, 0, 127);
  context.putImageData(cellsRender, 0, 0);
  drawPathfindingStartCell();
  drawPath();
  drawUI();
}


