let models = [];
let modelNames = [
  'container-closed.obj',
  'container-open-8.obj',
  'container-open-18.obj',
  'container-open-28.obj'
];
let currentModelIndex = 0;

function preload() {
  // Load all 3D models
  for (let i = 0; i < modelNames.length; i++) {
    models[i] = loadModel('assets/' + modelNames[i]);
  }
}

function setup() {
  createCanvas(800, 600, WEBGL);
}

function draw() {
  background(220);
  // Enable orbiting with the mouse.
  orbitControl();

  // Style the box.
  normalMaterial();
  
  // Add some lighting
  ambientLight(60);
  directionalLight(255, 255, 255, -1, 0.5, -1);
  
  // Scale the model if needed (adjust as necessary)
  scale(500);
  
  // Render the current model
  if (models[currentModelIndex]) {
    model(models[currentModelIndex]);
  }
}

function keyPressed() {
  // Switch to the next model when spacebar is pressed
  if (key === ' ') {
    currentModelIndex = (currentModelIndex + 1) % models.length;
    console.log('Switched to model:', modelNames[currentModelIndex]);
  }
}
