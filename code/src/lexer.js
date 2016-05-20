import bounds from './util/bounds.js';
import { LineBreakKind } from './token.js';
import tokenCollection from './token-collection.js';
import fragmentController from './fragment-controller.js';

export default function lexer( tokenizer, contextualizer ) {
	let code = '';
	const tokens = tokenCollection( contextualizer.lineCutTokens );

	const fragments = fragmentController( contextualizer, tokens );

	function input( newCode, start, end ) {
		if ( typeof start === 'number' && typeof end === 'number' ) {
			inputPrepared(
				prepareCode( newCode ),
				bounds( cursorToOffset( start ), cursorToOffset( end ) )
			);
			return;
		}

		const prepared = prepareCode( newCode );

		if ( !code ) {
			inputPrepared( prepared, bounds( 0, 0) );
		} else {
			if ( newCode !== code ) {
				const diff = computeDifference( actualCode, prepared );
				inputPrepared(
					newCode.clice( diff[ 0 ], prepared.length - diff[ 1 ] ),
					bounds( diff[ 0 ], code.length - diff[ 1 ] )
				);
			}
		}
	}

	function reference( index ) {
		return tokens.references
			.lift( index )
			.getOrElse( index < 0 ? tokens.head : tokens.last );
	}

	function rangeToString( range ) {
		return tokens.range( range );
	}

	function highlight( bounds, limit ) {
		return tokens.highlight( bounds, limit || none );
	}

	function computeDifference( first, second ) {
		let head = 0;
		let tail = 1;

		while ( first[ head ] === second[ head ] )
			head++;

		while ( first[ first.length - tail ] === second[ second.length - tail ] )
			tail++;

		return [ head, tail - 1 ];
	}

	function prepareCode( source ) {
		return source
      .replace( "\r\n", "\n" )
      .replace( "\r", "\n" )
      .replace( /\n+$/, "" );
	}

	function align( range ) {
		let start = 0;
		let end = 0;
		let line = 0;
		let offset = 0;
		let index = 0;

		for ( const token of tokens.descriptions ) {
			const next = offset + token.value.length;

			if ( token.kind === LineBreakKind ) {
				if ( offset < range.start ) {
					start = index;
				}
				if ( range.end < next ) {
					end = index + 1;
					break;
				}

				line += 1;
			}

			offset = next;
			index += 1;
		}

		return bounds( start, end );
	}

	return { fragments, input, reference, rangeToString };
}
