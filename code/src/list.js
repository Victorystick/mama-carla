import map from './map.js';
import { some, none } from './option.js';

const listDelegate = {
	filter( fn ) {
		return list( this.value.filter( fn ) );
	},

	find( fn ) {
		for ( const value of this.value ) {
			if ( fn( value ) ) {
				return some( value );
			}
		}

		return none;
	},

	groupBy( fn ) {
		const m = map();

		for ( const value of this.value ) {
			const key = fn( value );

			m.put( key, m.getOrElse( key, empty )
				.push( value ) );
		}

		return m;
	},

	get head() {
		return this.value[ 0 ];
	},

	get last() {
		return this.value[ this.value.length - 1 ];
	},

	lift( i ) {
		return  0 <= i && i < this.value.length ?
			some( this.value[ i ] ) :
			none;
	},

	map( fn ) {
		return list( this.value.map( fn ) );
	},

	push( value ) {
		this.value.push( value );
		return this;
	}
};

export default function list( arr ) {
	const o = Object.create( listDelegate );
	o.value = arr;
	return o;
}

export const empty = list([]);

empty.push = x => list([ x ]);
