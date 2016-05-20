import iterable from './iterable.js';
import { identity, self } from './utils.js';

export const none = {
	isNone: true,
	map: self,
	filter: self,
	find: self,
	match: obj => obj.none(),
	getOrElse: identity,

	[Symbol.iterator]: empty
};

export function some( value ) {
	const o = Object.create( someDelegate );
  o.value = value;
	return o;
}

const someDelegate = {
	isNone: false,

	map( fn ) {
		return some( fn( this.value ) );
	},

	find( fn ) {
		return fn( this.value ) ? this : none;
	},

	match( obj ) {
		return obj.some( this.value );
	},

	getOrElse() {
		return this.value;
	}
};

someDelegate.filter = someDelegate.find;
