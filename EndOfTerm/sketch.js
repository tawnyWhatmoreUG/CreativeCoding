let containerBase;
let containerLid;
let containerTexture;
let debugInfo;

// Loading state variables
let modelsLoaded = 0;
let loadingComplete = false;
let loadingStartTime;

function preload() {
  loadingStartTime = millis();
  
  // Load texture - using the color/diffuse map
  containerTexture = loadImage('assets/textures/food-container-040-col-metalness-4k.png',
    () => {
      console.log('Texture loaded successfully');
    },
    (error) => {
      console.error('Failed to load texture:', error);
    }
  );
  
  // Load models with success/error callbacks
  containerBase = loadModel('assets/container-base.obj', 
    () => {
      console.log('Container base loaded');
     
    },
    (error) => {
      console.error('Failed to load container base:', error);
    }
  );
  
  containerLid = loadModel('assets/container-lid.obj',
    () => {
      console.log('Container lid loaded');
    },
    (error) => {
      console.error('Failed to load container lid:', error);
    }
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // Create debug info element
  debugInfo = createDiv();
  debugInfo.position(10, 10);
  debugInfo.style('color', 'black');
  debugInfo.style('background', 'rgba(255, 255, 255, 0.8)');
  debugInfo.style('padding', '10px');
  debugInfo.style('font-family', 'monospace');
  debugInfo.style('pointer-events', 'none'); // Let clicks pass through to canvas
}

function draw() {
  background(220);

  // Fixed camera with parallax effect
  // Base positions - these are the default camera positions
  let baseCamX = 0; // 0 is centered on the model
  let baseCamY = -115; // Raise the camera to look down slightly
  let baseCamZ = -200; //negative value is more zoomed out, away from the center
  
  // Calculating parallax offset based on mouse position
  // map mouse coordinates in the canvas, to create a subtle parallax effect based on parallax strength value.
  let parallaxStrength = 15; // Adjust this for more/less parallax
  let offsetX = map(mouseX, 0, width, -parallaxStrength, parallaxStrength);
  let offsetY = map(mouseY, 0, height, -parallaxStrength, parallaxStrength);
  
  // Apply parallax to camera position
  let camX = baseCamX + offsetX;
  let camY = baseCamY + (offsetY*5); // Increased Y parallax effect, to give more vertical movement 
  let camZ = baseCamZ + offsetY;
  
  // Set camera position
  // camera(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ)
  // Adjust centerX, centerY, centerZ to change where the camera looks
  camera(camX, camY, camZ, 0, 50, 0, 0, 20, 0);
  
  //view for camera debug info - helps to figure out position coordinates. 
  //debugCamera();

  // Add extra point lights
  //pointLight method signature: pointLight(v1, v2, v3, x, y, z)
  pointLight(255, 255, 255, 200, -200, 200);
  
  // Add ambient light for better material lighting, can appear bit dark without 
  ambientLight(120, 120, 120);
  
  noStroke();
  
  // The Base
  push();
  translate(0, 0, 0); // Move base to origin
  texture(containerTexture);
  shininess(30); // Add a bit of shininess
  //specularMaterial(250); // Add specular highlights (white-ish)
  model(containerBase);
  pop();
  
  //The Lid
  push();
  translate(0, 0, 0); // Move lid to the right to align with base
  
  // Flip the texture horizontally for the lid to fix backwards text
  push();
  scale(-1, 1, 1); // Flip horizontally so text isn't backwards on the label
  texture(containerTexture); // Apply the imported texture. 
  shininess(50); // More shiny than the base
  specularMaterial(120); // Brighter highlights
  //render the model
  model(containerLid);
  pop();
}

// Debug camera position and orientation - just a helper for dev purposes. tracks the camera position and where it's looking to make adjustments easier.
function debugCamera() {
  //checks if the renderer and current camera are defined
  if (typeof _renderer === 'undefined' || !_renderer._curCamera) return;
  
  //set current camera to variable
  let cam = _renderer._curCamera;
  
  // Round to 1 decimal place for easy reading
  let x = cam.eyeX.toFixed(1);
  let y = cam.eyeY.toFixed(1);
  let z = cam.eyeZ.toFixed(1);
  
  // Also show center (where it's looking)
  let cx = cam.centerX.toFixed(1);
  let cy = cam.centerY.toFixed(20);
  let cz = cam.centerZ.toFixed(1);
  
  //add basic html marketup to display the info
  debugInfo.html(`
    <b>Camera Position:</b><br>
    X: ${x}<br>
    Y: ${y}<br>
    Z: ${z}<br>
    <br>
    <b>Looking At:</b><br>
    X: ${cx}<br>
    Y: ${cy}<br>
    Z: ${cz}
  `);
}

// Handle window resizing
function windowResized() {
  //resize the canvas along with window resizes 
  resizeCanvas(windowWidth, windowHeight);
}

