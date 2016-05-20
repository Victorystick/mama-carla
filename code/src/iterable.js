import { some, none } from './option.js';

export default function iterable() {
	const o = Object.create( iterableMethods );
	o.arr = [].concat.apply( [], arguments );
	return o;
}

const iterableMethods = {
	map( fn ) {
		return iterable( this.arr.map( fn ) );
	},

	find( fn ) {
		for (let i = 0; i < this.arr.length; i++) {
			let val = this.arr[ i ];

			if ( fn( val ) ) {
				return some( val );
			}
		}

		return none;
	},

	[ Symbol.iterator ]() {
		return this.arr[ Symbol.iterator ]();
	}
};
