import { none } from '../option.js';

export default function tokenRef( collection, index ) {
	let fragment = none;
	let removed = false;

	function token() {
		return collection.descriptions( index );
	}

	function toString() {
		if ( removed ) return 'removed';

		const cursor = collection.cursor( index );
		return cursor[ 0 ] + ':' + cursor[ 1 ];
	}

	function remove() {
		removed = true;
		onremove.trigger( o );
	}

	const o = { token, remove, toString };
	return o;
}
