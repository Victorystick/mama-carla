import { StringSet } from './string-collections.js';
import { some } from './option.js';

function charset( set, inSet ) {
	return ( code, position ) =>
		some( position + 1 )
			.filter( next => next <= code.length )
			.filter( _ => set.contains( code[ position ] ) == inSet );
}

function repetition( sub, min, max ) {
	max = max || Number.MAX_SAFE_INTEGER;

	return ( code, position ) => {
		let count = 0,
			finished = false,
			current = position;

		const matcher = {
			some( next ) {
				current = next;
				count += 1;
			},
			none() { finished = true; }
		};

		while ( count < max && !finished ) {
			sub( code, current ).match( matcher )
		}

		return some( current ).filter( _ => count >= min );
	};
}

export function zeroOrMore( sub ) {
	return repetition( sub, 0 );
}

export function oneOrMore( sub ) {
	return repetition( sub, 1 );
}

export function optional( sub ) {
	return repetition( sub, 0, 1 );
}

export function repeat( sub, times ) {
	return repetition( sub, times, times );
}

export function anyOf( pattern ) {
	return charset( new StringSet( pattern.split( '' ) ), true );
}

export function anyExceptOf( pattern ) {
	return charset( new StringSet( pattern.split( '' ) ), false );
}

const _nothing = anyOf( '' );

export function nothing() {
	return _nothing;
}

const _any = anyExceptOf( '' );

export function any() {
	return _any;
}

// rangeOf
export function rangeOf( a, b ) {
	return ( code, position ) => some( position + 1 )
		.filter( next => next <= code.length )
		.filter( _ => a <= code[ position ] && code[ position ] <= b )
}

export function chunk( pattern ) {
	return ( code, position ) => some( position + pattern.length )
		.filter( next => next <= code.length && pattern === code.slice( position, next ) );
}

// test
// testNot

export function sequence( steps ) {
	return ( code, position ) => {
		for (let i = 0; i < steps.length; i++) {
			const result = steps[ i ]( code, position );

			if ( result.isNone ) {
				return result;
			}

			position = result.value;
		}
		return some( position );
		// TODO: flatReduce
		// steps.reduce( ( next, fn ) => fn( code, next ), position );
	};
}

export function choice( cases ) {
 return ( code, position ) => {
	 let result;

	 for (let i = 0; i < cases.length; i++) {
	 	result = cases[ i ]( code, position );

		if ( !result.isNone ) {
			return result;
		}
	 }

	 return result;
 };
}
