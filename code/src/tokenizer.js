import { StringSet, StringMap } from './string-collections.js';
import { some, none } from './option.js';
import iterable from './iterable.js';

import * as token from './token.js';
import { chunk } from './matcher.js';

export default function tokenizer() {
	const _rules = new StringMap();
	const order = [];
	const _terminals = [];
	const _keywords = new StringSet();
	const skips = new StringSet();
	const mutables = new StringSet();
	const indentations = new StringSet();

	function ruleDefinition( name ) {
		return {
			get skip() {
				return skips.add( name ), this;
			},

			get mutable() {
				return mutables.add( name ), this;
			},

			get indentation() {
				return mutables.add( name ), this;
			}
		}
	}

	function tokenCategory( name, matcher ) {
		if ( !_rules.contains( name ) ) {
			_rules.put( name, matcher );
			order.push( name );
		}

		return ruleDefinition( name );
	}

	function terminals( patterns ) {
		patterns.forEach( pattern => _terminals.push([ pattern, chunk( pattern ) ]) );
	}

	function keywords( patterns ) {
		patterns.forEach( _keywords.add );
	}

	function tokenize( input ) {
		const rules = iterable( _terminals, _rules.toList() );

		const output = [];
		let position = 0;
		let inTheBegin = true;

		while ( position < input.length ) {
			let start = position;

			let application = none;

			while ( position < input.length && application.isNone ) {
				application = rules
					.map( rule => [ rule[ 0 ], rule[ 1 ]( input, position ) ])
					.find( candidate => !candidate[ 1 ].isNone )
					.map( result => [ result[ 0 ], result[ 1 ].getOrElse( position + 1 ) ])

				if ( application.isNone ) position += 1;
			}

			if ( start < position ) {
				output.push( token.unknown( input.slice( start, position ) ) );
			}

			if ( !application.isNone ) {
				const successful = application.value;
				const value = input.substring( position, successful[ 1 ] );

				if ( _keywords.contains( value ) ) {
					output.push( token.terminal( value ) );
				} else {
					const kind = successful[ 0 ];

					const indentation = inTheBegin && indentations.contains( kind );
					if ( !indentation ) inTheBegin = false;

					output.push( new token.Token(
						kind, value,
						skips.contains( kind ),
						mutables.contains( kind ),
						indentation
					));

					position = successful[ 1 ];
				}
			}
		}

		return output;
	}

	return { tokenCategory, terminals, keywords, tokenize };
};
