import assert from 'assert';

import map from '../src/map.js';
import list from '../src/list.js';

describe( 'list', function () {
	it( 'groupBy', function () {
		const m = map();

		m.put( 1, list([
			{ key: 1, value: 2 },
			{ key: 1, value: 5 }
		]));

		m.put( 2, list([
			{ key: 2, value: 7 }
		]));

		assert.deepEqual(
			list([
				{ key: 1, value: 2 },
				{ key: 2, value: 7 },
				{ key: 1, value: 5 }
			]).groupBy( x => x.key ),
			m
		);
	});
});
