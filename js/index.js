const modelList = [
  'models/camellya/┤╗.model3.json',
  'models/vivian/薇薇安.model3.json',
  'models/huohuo/huohuo.model3.json',
  "models/Sylvir/Number1.model3.json"
];
const cubism4Model = modelList[1];
let model4 = null;
let audioContext = null;
let analyser = null;
let dataArray = null;
let source = null;

(async function main() {
  const app = new PIXI.Application({
    view: document.getElementById("canvas"),
    autoStart: true,
    resizeTo: window,
    transparent: true,
    backgroundAlpha: 0
  });
  model4 = await PIXI.live2d.Live2DModel.from(cubism4Model);
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
  model4.eventMode = 'static';
  model4.cursor = 'pointer';

  model4.on('pointerdown', (e) => {
    model4.offsetX = e.data.global.x - model4.position.x;
    model4.offsetY = e.data.global.y - model4.position.y;
    model4.dragging = true;
  });

  model4.on('pointerup', () => {
    model4.dragging = false;
  });

  model4.on('pointermove', (e) => {
    if (model4.dragging) {
      model4.position.set(
        e.data.global.x - model4.offsetX,
        e.data.global.y - model4.offsetY
      );
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