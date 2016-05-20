'use strict';

function blank() {
	return Object.create( null );
}

function StringMap() {
	this.data = blank();
}

StringMap.prototype.put = function ( name, value ) {
	return this.data[ name ] = value;
};

StringMap.prototype.contains = function ( name ) {
	return name in this.data;
};

StringMap.prototype.toList = function () {
	return Object.keys( this.data ).map( key => [ key, this.data[ key ] ] );
};

function StringSet( arr ) {
	const map = new StringMap();
	map.add = name => map.put( name, null );
	map.toList = () => Object.keys( map.data );

	( arr || [] ).forEach( map.add );

	return map;
}

function self() {
	return this;
}

function identity( x ) {
	return x;
}

const none = {
	isNone: true,
	map: self,
	filter: self,
	find: self,
	match: obj => obj.none(),
	getOrElse: identity
};

function some( value ) {
	const o = Object.create( someDelegate );
  o.value = value;
	return o;
}

const someDelegate = {
	isNone: false,

	map( fn ) {
		return some( fn( this.value ) );
	},

	find( fn ) {
		return fn( this.value ) ? this : none;
	},

	match( obj ) {
		return obj.some( this.value );
	},

	getOrElse() {
		return this.value;
	}
};

someDelegate.filter = someDelegate.find;

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

function zeroOrMore( sub ) {
	return repetition( sub, 0 );
}

function oneOrMore( sub ) {
	return repetition( sub, 1 );
}

function optional( sub ) {
	return repetition( sub, 0, 1 );
}

function repeat( matcher, times ) {
	return repetition( sub, times, times );
}

function anyOf( pattern ) {
	return charset( new StringSet( pattern.split( '' ) ), true );
}

function anyExceptOf( pattern ) {
	return charset( new StringSet( pattern.split( '' ) ), false );
}

const _nothing = anyOf( '' );

function nothing() {
	return _nothing;
}

const _any = anyExceptOf( '' );

function any() {
	return _any;
}

// rangeOf
function rangeOf( a, b ) {
	return ( code, position ) => some( position + 1 )
		.filter( next => next <= code.length )
		.filter( _ => a <= code[ position ] && code[ position ] <= b )
}

function chunk( pattern ) {
	return ( code, position ) => some( position + pattern.length )
		.filter( next => next <= code.length && pattern === code.slice( position, next ) );
}

// test
// testNot

function sequence( steps ) {
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

function choice( cases ) {
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


var match = Object.freeze({
	zeroOrMore: zeroOrMore,
	oneOrMore: oneOrMore,
	optional: optional,
	repeat: repeat,
	anyOf: anyOf,
	anyExceptOf: anyExceptOf,
	nothing: nothing,
	any: any,
	rangeOf: rangeOf,
	chunk: chunk,
	sequence: sequence,
	choice: choice
});



var rule = Object.freeze({

});

function Token( kind, value, skipped, mutable, indentation ) {
	this.kind = kind;
	this.value = value;
	this.skipped = skipped || false;
	this.mutable = mutable || false;
	this.indentation = indentation || false;
}

const LineBreakKind = 'lineBreak';
const UnknownKind = 'unknown';

function unknown( value ) {
	return new Token( UnknownKind, value );
}

function lineBreak( value ) {
	return new Token( LineBreakKind, value );
}

function terminal( value ) {
	return new Token( value, value );
}


var token = Object.freeze({
	Token: Token,
	unknown: unknown,
	lineBreak: lineBreak,
	terminal: terminal
});

function iterable() {
	const o = Object.create( iterableMethods );
	o.arr = [].concat.apply( [], arguments );
	return o;
}

const iterableMethods = {
	map( fn ) {
		return iterable( this.arr.map( fn ) );
	},

	find( fn ) {
		for (let i = 0; i < this.arr.length; i++) {
			let val = this.arr[ i ];

			if ( fn( val ) ) {
				return some( val );
			}
		}

		return none;
	}
};

function tokenizer() {
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
				output.push( unknown( input.slice( start, position ) ) );
			}

			if ( !application.isNone ) {
				const successful = application.value;
				const value = input.substring( position, successful[ 1 ] );

				if ( _keywords.contains( value ) ) {
					output.push( terminal( value ) );
				} else {
					const kind = successful[ 0 ];

					const indentation = inTheBegin && indentations.contains( kind );
					if ( !indentation ) inTheBegin = false;

					output.push( new Token(
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

function contextualizer() {
	const _pairs = [];
	let stateMachineCache;

	function tokenPairDefinition( open, close, context ) {
		return {
			get topContext() {
				return this;
			},

			get forceSkip() {
				return this;
			}
		};
	}

	function trackContext( open, close ) {
		const result = tokenPairDefinition( open, close, _pairs.length );

		_pairs.push( result );
		stateMachineCache = none;

		return result;
	}

	function contextualize( entry, tokens ) {
		const stateMachine = _stateMachine;
		let context = entry;

		for (const token of tokens) {
			const next = stateMachine.get( token.kind )
				.flatMap( _ => _.get( context.kind ) )
				.orElse( pair( RegularSeam, 0 ) );

			token.seam = next[ 0 ];

			token[ 0 ].match({
				EnterContext() {
					context = context.branch( next[ 1 ] );
					token.context = context;
				},

				LeaveContext() {
					token.context = context;
					context = context.parent.getOrElse( context.base );
				},

				default() {
					token.context = context;
				}
			});
		}

		return context;
	}

	return { trackContext, contextualize };
};

exports.match = match;
exports.rule = rule;
exports.token = token;
exports.tokenizer = tokenizer;
exports.contextualizer = contextualizer;