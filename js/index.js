const modelList = [
  'models/camellya/┤╗.model3.json',
  'models/vivian/薇薇安.model3.json',
  'models/huohuo/huohuo.model3.json',
  "models/Sylvir/Number1.model3.json"
];
// const cubism4Model = modelList[1];
const R2_ZIP_URL = 'https://assets.auroramusicvietnam.net/vivian.zip'; 

// GLOBAL VIRTUAL SERVER SETUP
const VIRTUAL_BASE_URL = 'http://localhost/virtual_model/';
const virtualFiles = new Map();

// Install Global XHR Interceptor
(function setupVirtualServer() {
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
        // Only intercept requests to our virtual server
        if (typeof url === 'string' && url.startsWith(VIRTUAL_BASE_URL)) {
            // Normalize URL (handle encoding differences)
            let targetBlobUrl = virtualFiles.get(url);
            
            // If not found, try decoding
            if (!targetBlobUrl) {
                try {
                    targetBlobUrl = virtualFiles.get(decodeURI(url));
                } catch(e) {}
            }
            
            // If still not found, try encoding the suffix
            if (!targetBlobUrl) {
                 try {
                     const prefix = VIRTUAL_BASE_URL;
                     const suffix = url.substring(prefix.length);
                     const encodedSuffix = suffix.split('/').map(encodeURIComponent).join('/');
                     targetBlobUrl = virtualFiles.get(prefix + encodedSuffix);
                 } catch(e) {}
            }

            if (targetBlobUrl) {
                // console.log(`[VirtualServer] Serving: ${url}`);
                return originalXhrOpen.call(this, method, targetBlobUrl, ...args);
            } else {
                console.warn(`[VirtualServer] 404 Not Found: ${url}`);
            }
        }
        
        return originalXhrOpen.call(this, method, url, ...args);
    };
})();

let model4 = null;
let audioContext = null;
let analyser = null;
let dataArray = null;
let source = null;

function updateStatus(text, progress) {
    const textEl = document.getElementById('loading-text');
    const barEl = document.getElementById('progress-bar');
    if (textEl) textEl.textContent = text;
    if (barEl) barEl.style.width = `${progress * 100}%`;
}

async function fetchChunk(url, start, end, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                headers: { 'Range': `bytes=${start}-${end}` }
            });
            if (!response.ok && response.status !== 206) {
                throw new Error(`Status ${response.status}`);
            }
            return await response.blob();
        } catch (e) {
            console.warn(`Chunk ${start}-${end} failed (attempt ${i+1}):`, e);
            if (i === retries - 1) throw e;
            await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i))); // Exponential backoff
        }
    }
}

async function fetchWithChunks(url, onProgress) {
    // 1. Get total size
    const headRes = await fetch(url, { method: 'HEAD' });
    if (!headRes.ok) throw new Error(`HEAD failed: ${headRes.status}`);
    const totalSize = parseInt(headRes.headers.get('content-length') || '0', 10);
    if (!totalSize) throw new Error('Cannot determine file size');

    const chunkSize = 5 * 1024 * 1024; // 5MB
    const chunks = [];
    let loaded = 0;
    
    // 2. Download in chunks
    for (let start = 0; start < totalSize; start += chunkSize) {
        const end = Math.min(start + chunkSize - 1, totalSize - 1);
        const chunkBlob = await fetchChunk(url, start, end);
        chunks.push(chunkBlob);
        loaded += chunkBlob.size;
        onProgress(loaded / totalSize);
    }

    return new Blob(chunks);
}

async function loadZipModel(zipUrl) {
  try {
    updateStatus("Downloading assets...", 0.1);
    
    // Use fetchWithChunks for robust download
    const blob = await fetchWithChunks(zipUrl, (progress) => {
        // Download phase: 10% to 50%
        updateStatus(`Downloading... ${Math.round(progress * 100)}%`, 0.1 + (progress * 0.4));
    });

    updateStatus("Unpacking assets...", 0.55);
    const zip = await JSZip.loadAsync(blob);

    // Find the .model3.json file
    const filePaths = Object.keys(zip.files);
    const modelPath = filePaths.find(p => p.endsWith('.model3.json') || p.endsWith('.model.json'));
    if (!modelPath) throw new Error('No .model3.json or .model.json found in zip');

    const rootDir = modelPath.substring(0, modelPath.lastIndexOf('/') + 1);
    const files = {};

    updateStatus("Processing files...", 0.65);
    // Unzip all files to Blob URLs
    await Promise.all(filePaths.map(async path => {
      const file = zip.file(path);
      if (!file || file.dir) return;
      const b = await file.async('blob');
      // Create a blob URL for each file
      files[path] = URL.createObjectURL(b);
    }));

    updateStatus("Configuring model...", 0.8);
    // Parse the model JSON
    const modelJsonStr = await zip.file(modelPath).async('string');
    const modelJson = JSON.parse(modelJsonStr);

    // VIRTUAL SERVER STRATEGY
    // Set the model URL to our virtual server
    modelJson.url = VIRTUAL_BASE_URL + 'model.json';

    // 1. Populate Global Map of Virtual Paths to Blob URLs
    virtualFiles.clear(); // Clear previous model files if any
    
    const addToVirtualMap = (relativePath, blobUrl) => {
         const cleanPath = relativePath.startsWith('./') ? relativePath.slice(2) : relativePath;
         const virtualUrl = VIRTUAL_BASE_URL + cleanPath;
         
         // Store raw version
         virtualFiles.set(virtualUrl, blobUrl);
         
         // Store encoded version
         try {
             const encodedPath = cleanPath.split('/').map(encodeURIComponent).join('/');
             const virtualUrlEncoded = VIRTUAL_BASE_URL + encodedPath;
             if (virtualUrlEncoded !== virtualUrl) {
                 virtualFiles.set(virtualUrlEncoded, blobUrl);
             }
         } catch (e) { console.warn("Encoding error", e); }
         
         return virtualUrl;
    };
    
    for (const [zipPath, blobUrl] of Object.entries(files)) {
        if (zipPath.startsWith(rootDir)) {
            const relativePath = zipPath.substring(rootDir.length);
            addToVirtualMap(relativePath, blobUrl);
        }
    }

    // 2. Pre-load Textures into Pixi Cache
    if (modelJson.FileReferences && Array.isArray(modelJson.FileReferences.Textures)) {
        updateStatus("Loading textures...", 0.85);
        await Promise.all(modelJson.FileReferences.Textures.map(async (texPath) => {
            const cleanTexPath = texPath.startsWith('./') ? texPath.slice(2) : texPath;
            const virtualUrl = VIRTUAL_BASE_URL + cleanTexPath;
            
            // Try getting from map using raw or encoded
            let blobUrl = virtualFiles.get(virtualUrl);
            if (!blobUrl) {
                 const encodedPath = cleanTexPath.split('/').map(encodeURIComponent).join('/');
                 blobUrl = virtualFiles.get(VIRTUAL_BASE_URL + encodedPath);
            }
            
            if (blobUrl) {
                try {
                    const texture = await PIXI.Texture.fromURL(blobUrl);
                    PIXI.Texture.addToCache(texture, virtualUrl);
                    
                    const encodedPath = cleanTexPath.split('/').map(encodeURIComponent).join('/');
                    const encodedUrl = VIRTUAL_BASE_URL + encodedPath;
                    if (encodedUrl !== virtualUrl) {
                        PIXI.Texture.addToCache(texture, encodedUrl);
                    }
                } catch (e) {
                    console.warn("Failed to preload texture:", texPath, e);
                }
            } else {
                console.warn("Texture not found in zip:", texPath);
            }
        }));
    }

    // No need to set up XHR interceptor here anymore, it's global!

    updateStatus("Initializing Live2D...", 0.9);
    
    const model = await PIXI.live2d.Live2DModel.from(modelJson, { autoInteract: false });
    
    updateStatus("Ready!", 1.0);
    return model;

  } catch (e) {
    console.error("Failed to load model from zip:", e);
    updateStatus("Error loading model", 0);
    throw e;
  }
}

(async function main() {
  const app = new PIXI.Application({
    view: document.getElementById("canvas"),
    autoStart: true,
    resizeTo: window,
    transparent: true,
    backgroundAlpha: 0
  });
  
  // model4 = await PIXI.live2d.Live2DModel.from(cubism4Model);
  model4 = await loadZipModel(R2_ZIP_URL);
  
  window.model4 = model4;
  app.stage.addChild(model4);
  resizeModel(0.14);

  // Hide Loading Overlay
  const overlay = document.getElementById('loading-overlay');
  if(overlay) {
      overlay.classList.add('fade-out'); // Apply the class that triggers transition
      setTimeout(() => overlay.remove(), 1500); // Remove element after transition completes
  }

  app.ticker.add(() => {
    if (model4 && model4.internalModel && analyser && dataArray) {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      let count = 0;
      for (let i = 4; i < 100; i++) {
        sum += dataArray[i];
        count++;
      }
      let average = sum / count;
      if (average < 10) {
        average = 0;
      }
      const sensitivity = 60;
      let targetOpenness = average / sensitivity;
      targetOpenness = Math.pow(targetOpenness, 1.5);
      targetOpenness = Math.min(1.0, Math.max(0.0, targetOpenness));
      model4.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', targetOpenness);
    }
  });

  model4.on("hit", (e) => {
    if (e.includes('body')) {
      console.log('hit');
      model4.motion('TapBody');
    }
  });
  
  // Enable interaction (PixiJS v6 uses 'interactive', not 'eventMode')
  model4.interactive = true;
  model4.cursor = 'pointer';
  model4.isHovering = false;

  model4.on('pointerover', () => { model4.isHovering = true; });
  model4.on('pointerout', () => { model4.isHovering = false; });

  model4.on('pointerdown', (e) => {
    model4.offsetX = e.data.global.x - model4.position.x;
    model4.offsetY = e.data.global.y - model4.position.y;
    model4.dragging = true;
  });

  model4.on('pointerup', () => {
    model4.dragging = false;
  });
  
  model4.on('pointerupoutside', () => {
    model4.dragging = false;
  });

  model4.on('pointermove', (e) => {
    // Make the model look at the mouse cursor
    model4.focus(e.data.global.x, e.data.global.y);
    
    if (model4.dragging) {
      model4.position.set(
        e.data.global.x - model4.offsetX,
        e.data.global.y - model4.offsetY
      );
    }
  });

  // Zoom with scroll wheel (only when hovering)
  window.addEventListener('wheel', (e) => {
    if (model4 && model4.isHovering) {
       // Determine zoom direction
       const zoomFactor = 1.1;
       let newScale = model4.scale.x;
       
       if (e.deltaY < 0) {
           // Zoom In
           newScale *= zoomFactor;
       } else {
           // Zoom Out
           newScale /= zoomFactor;
       }
       
       // Optional: Clamp scale to reasonable limits
       newScale = Math.min(Math.max(newScale, 0.05), 1.0);
       
       model4.scale.set(newScale);
    }
  });
})();
function resizeModel(scale) {
  if (!model4) return;
  // Dynamic sidebar width check
  const sidebarWidth = (typeof window.getSidebarWidth === 'function') ? window.getSidebarWidth() : 260;
  const chatboxWidth = 420; // Right chatbox width
  const availableWidth = window.innerWidth - sidebarWidth - chatboxWidth;
  
  model4.scale.set(scale);
  // Center in the available space between sidebar and chatbox
  model4.x = sidebarWidth + (availableWidth - model4.width) / 2;
  model4.y = (window.innerHeight - model4.height) / 2 + 100; // Keep vertical centering
}

// Re-trigger resize when sidebar toggles (listened via window resize or custom event if implemented)
window.addEventListener('resize', () => resizeModel(model4 ? model4.scale.x : 0.14));
window.connectAudioToLive2D = function (audioElement) {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.5;
  const bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  if (source) {
    source.disconnect();
  }
  source = audioContext.createMediaElementSource(audioElement);
  source.connect(analyser);
  analyser.connect(audioContext.destination);
};