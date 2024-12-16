import * as THREE from 'three';
import { GUI } from 'dat.gui';
import FFT from 'fft.js';
import { gsap } from 'gsap';
// This will wait for the DOM content to load
document.addEventListener("DOMContentLoaded", function () {
  // Get the button by its ID
  const button = document.getElementById("loadButton");

  // Add click event listener to the button
  button.addEventListener("click", function () {
    alert("Button clicked! Now you can add your FFT logic here.");
    
    // Example: Call a function here that starts your visualization or logic
    startVisualization();
  });

  // Function to simulate FFT visualization
  function startVisualization() {
    console.log("FFT Visualization started!");
    // Your FFT logic goes here
  }
});

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('webgl-container').appendChild(renderer.domElement);

// Waveform Geometry
const geometry = new THREE.BufferGeometry();
const vertices = [];
const timeDomainVertices = []; // Store original waveform vertices

// Parameters
const params = {
  amplitude: 2,
  frequency: 1,
};

// Generate Sine Wave Vertices
const points = 500;
for (let i = 0; i < points; i++) {
  const x = (i / points) * 20 - 10;
  const y = params.amplitude * Math.sin(params.frequency * x);
  vertices.push(x, y, 0);
  timeDomainVertices.push(y); // Save time-domain data
}

geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

// Waveform Material
const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
const line = new THREE.Line(geometry, material);
scene.add(line);

// Camera Position
camera.position.z = 15;

// GUI for Controls
const gui = new GUI({ autoPlace: false });
document.getElementById('gui-container').appendChild(gui.domElement);

// GUI Controls
gui.add(params, 'amplitude', 0.5, 100, 0.1).onChange(() => updateWaveform());
gui.add(params, 'frequency', 0.5, 100, 0.1).onChange(() => updateWaveform());

// Toggle for Domain View
const viewParams = { view: 'Time Domain' };
gui.add(viewParams, 'view', ['Time Domain', 'Frequency Domain']).onChange(() => updateView());

// Function to calculate the next power of two
function nextPowerOfTwo(x) {
    return Math.pow(2, Math.ceil(Math.log2(x)));
}

// Function to pad the array to the next power of two
function padArray(array) {
    const originalLength = array.length;
    const newLength = nextPowerOfTwo(originalLength);
    const paddedArray = new Float32Array(newLength);
    paddedArray.set(array); // Copy original data into padded array
    return paddedArray;
}

// Function to Compute Fourier Transform
function computeFFT(amplitudeArray) {
    const paddedArray = padArray(amplitudeArray); // Pad the array to power of two size
    const fft = new FFT(paddedArray.length); // Create FFT with padded length
    const complexArray = fft.createComplexArray(); // Real and imaginary parts
    const spectrum = fft.createComplexArray(); // FFT output

    // Fill input with time-domain signal
    for (let i = 0; i < paddedArray.length; i++) {
        complexArray[i * 2] = paddedArray[i]; // Real part
        complexArray[i * 2 + 1] = 0; // Imaginary part
    }

    // Perform FFT
    fft.transform(spectrum, complexArray);

    // Extract magnitude of frequencies
    const magnitudes = [];
    for (let i = 0; i < paddedArray.length / 2; i++) {
        const real = spectrum[i * 2];
        const imag = spectrum[i * 2 + 1];
        magnitudes.push(Math.sqrt(real * real + imag * imag));
    }

    return magnitudes;
}

// Smooth Transition Function for Animation
function smoothTransition(newValues) {
    const positions = geometry.attributes.position.array;

    for (let i = 0; i < newValues.length; i++) {
        gsap.to(positions, {
            duration: 1,
            [i * 3 + 1]: newValues[i],
            onUpdate: () => (geometry.attributes.position.needsUpdate = true),
        });
    }
}

// Update View Function
function updateView() {
    const positions = geometry.attributes.position.array;

    if (viewParams.view === 'Time Domain') {
        for (let i = 0; i < points; i++) {
            positions[i * 3 + 1] = timeDomainVertices[i];
        }
        geometry.attributes.position.needsUpdate = true;

    } else if (viewParams.view === 'Frequency Domain') {
        // Calculate FFT and update positions with magnitudes
        const magnitudes = computeFFT(timeDomainVertices);
        smoothTransition(magnitudes); // Use smooth transition for frequency domain view
    }
}

// Update Waveform Function
function updateWaveform() {
   const positions = geometry.attributes.position.array;
   for (let i = 0; i < points; i++) {
     const x = (i / points) * 20 -10;
     positions[i *3 +1] = params.amplitude * Math.sin(params.frequency * x);
     timeDomainVertices[i] = positions[i *3 +1]; // Update time domain data
   }
   geometry.attributes.position.needsUpdate= true;
}

// Animation Loop
function animate() {
   requestAnimationFrame(animate);
   renderer.render(scene, camera);
}

animate();
