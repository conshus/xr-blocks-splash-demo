import 'xrblocks/addons/simulator/SimulatorAddons.js';

import RAPIER from '@dimforge/rapier3d-simd-compat';
import * as xb from 'xrblocks';

import {SplashScript} from './SplashScript.js';
import {VonageAudioCall} from './VonageAudioCall.js';
import { ExitPanel } from './ExitButton.js';

const depthMeshColliderUpdateFps = xb.getUrlParamFloat(
  'depthMeshColliderUpdateFps',
  30
);
const splashScript = new SplashScript();

let options = new xb.Options();
options.depth = new xb.DepthOptions(xb.xrDepthMeshPhysicsOptions);
options.depth.depthMesh.colliderUpdateFps = depthMeshColliderUpdateFps;
options.xrButton = {
  ...options.xrButton,
  startText: '<i id="xrlogo"></i> MAKE A MESS',
  endText: '<i id="xrlogo"></i> MISSION COMPLETE',
};
options.physics.RAPIER = RAPIER;
options.physics.useEventQueue = true;
options.enableUI();

// Initializes the scene, camera, xrRenderer, controls, and XR button.
async function start() {
  xb.add(splashScript);
  xb.add(new VonageAudioCall());
  xb.add(new ExitPanel());
  await xb.init(options);
}

document.addEventListener('DOMContentLoaded', function () {
  start();
});