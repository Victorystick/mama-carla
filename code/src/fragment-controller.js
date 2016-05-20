import EventHandler from 'events';
// import _registry from './registry.js';
import { undefined } from './util/bounds.js';
import { none } from './option.js';
import { empty } from './map.js';

export default function fragmentController( contextualizer, tokens ) {
	// const registry = _registry();
	let invalidationContext = none;
	let invalidationRange = undefined;
	let invalidTokens = empty;
	let valid = true;


	return new EventHandler;
}
