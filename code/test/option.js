import assert from 'assert';
import { none, some } from '../src/option.js';

const add1 = x => x + 1;
const add1Some = x => some( x + 1 );

describe( 'option', () => {
	it( 'map', () => {
		assert.equal( none.map( add1 ), none );
		assert.deepEqual( some( 1 ).map( add1 ), some( 2 ) );
	});

	it.skip( 'flatMap', () => {
		assert.equal( some( 1 ),flatMap( constNone ), none );
		assert.deepEqual( some( 1 ),flatMap( add1Some ), some( 2 ) );
	});
});
