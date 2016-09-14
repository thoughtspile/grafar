// FIXME duct-tape
import { global } from './contextBusterHack';

import * as API from './api';
import * as polyfills from './polyfills';
import * as utils from './utils';
import * as arrayPool from './arrayPool';
import * as setUtils from './setUtils';
import * as vectorUtils from './vectorUtils';
import * as miscUtils from './miscUtils';
import * as arrayUtils from './arrayUtils';
import { Style } from './Style';
import * as GraphData from './GraphData';
import * as Parser from './Parser';
import * as Reactive from './Reactive';
import * as glUtils from './glUtils';
import * as topology from './topology';
import * as Graph from './Graph';
import * as Object from './Object';
import * as MathSystem from './MathSystem';
import * as Panel from './Panel';
import * as Observable from './Observable';
import * as demos from './demos';
import * as UI from './UI';

global.grafar.Style = Style;
