import { some, none } from './option.js';

const mapDelegate = {
	get( key ) {
		return key in this.value ?
			some( this.value[ key ] ) :
			none;
	},

	getOrElse( key, backup ) {
		return key in this.value ?
			this.value[ key ] :
			backup;
	},

	mapValues( fn ) {
		const m = map();

		for ( const name in this.value ) {
			m.put( name, fn( this.value[ name ] ) );
		}

		return m;
	},

	put( key, value ) {
		this.value[ key ] = value;
		return this;
	}
};

export const empty = map();
empty.put = ( key, value ) => map().put( key, value );

export default function map() {
	const o = Object.create( mapDelegate );
	o.value = Object.create( null );
	return o;
}
