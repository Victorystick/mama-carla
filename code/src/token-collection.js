import { LineBreakKind, lineBreak } from './token.js';
import tokenRef from './util/token-reference.js';
import list from './list.js';

export default function tokenCollection() {
	const o = Object.create( collectionDelegate );

	o.descriptions = list([ lineBreak ]);
	o.references = list([ tokenRef( o, 0 ) ]);
	o.head = tokenRef( o, 0 );
	o.last = tokenRef( o, 0 );

	return o;
}

const collectionDelegate = {
	cursor( tokenIndex ) {
		let line = 1;
		let column = 1;
		let currentIndex = 0;

		for ( const token of this.descriptions ) {
			currentIndex += 1;

			if ( currentIndex > tokenIndex ) break;

			if ( token.kind === LineBreakKind ) {
				line += 1;
				column = 1;
			} else {
				column += token.value.length;
			}
		}

		return [ line, column ];
	},

	range( range ) {
		let result = '';

		if ( range.defined ) {

		}

		return result;
	}
};
