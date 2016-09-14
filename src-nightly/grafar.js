import { grafar } from './api'

import * as UI from './UI';

import { Style } from './Style';
import { Panel } from './Panel';
import { GrafarObject } from './GrafarObject';
import * as generators from './generators';


grafar.Style = Style;
grafar.Panel = Panel;
grafar.Object = GrafarObject;

Object.keys(generators).forEach(key => {
	grafar[key] = generators[key];
});

window.grafar = grafar;
