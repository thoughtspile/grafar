import * as THREE from '../libs/three.min';
import Detector from '../libs/Detector';
import * as Stats from '../libs/stats.min';
import * as Color from '../libs/i-color.min';
import { OrbitControls } from '../libs/OrbitControls'; // FIXME non-standard

export const global = window;

THREE.OrbitControls = OrbitControls;
global.THREE = THREE;
global.Detector = Detector;
