import map from '../src/map.js';

export default function syntax( lexer ) {
	// A map from rule names to rule definitions.
	let rules = map();

	// A map from fragment ids to cache structs.
	let cache = map();


	function rule( name, constructor ) {
		rules.put( name, constructor );
	}

	lexer.fragments.on( 'invalidate', ([ fragment, range ]) => {
		let candidate = some( fragment );

		while ( candidate.exists( fragment => !cache.contains( fragment.id ) ) ) {
			candidate = candidate.flatMap( x => x.parent );
		}

		for ( const cache of cache.get ) {

		}
	});

	return { rule };
}
