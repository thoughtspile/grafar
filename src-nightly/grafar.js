// FIXME duct-tape
import { global } from './contextBusterHack';
import { grafar } from './api'

import * as UI from './UI';

import { Style } from './Style';
import { Panel } from './Panel';
import { GrafarObject } from './GrafarObject';
import * as generators from './generators';


global.grafar.Style = Style;
global.grafar.Panel = Panel;
global.grafar.Object = GrafarObject;

Object.keys(generators).forEach(key => {
	global.grafar[key] = generators[key];
});
