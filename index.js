const lib = require( './lib.js' );

const token = lib.token;
const tokenizer = lib.tokenizer;
const contextualizer = lib.contextualizer;
const m = lib.match;

var t = tokenizer();

const doubleQuote = m.chunk( '"' );
const num = m.rangeOf( '0', '9' );

t.tokenCategory(
	'whitespace',
	m.oneOrMore( m.anyOf( ' \t\f\n' ) )
).skip;

t.tokenCategory(
	'string',
	m.sequence([
		doubleQuote,
		m.zeroOrMore(m.choice([
			m.anyExceptOf( '\n\r\\"' )
		])),
		doubleQuote
	])
);

t.tokenCategory(
	'number',
	m.sequence([
		m.optional( m.chunk( '-' ) ),
		m.choice([
			m.chunk( '0' ),
			m.sequence([ m.rangeOf( '1', '9'), m.zeroOrMore( num )])
		]),
		m.optional( m.sequence([
			m.chunk( '.' ),
			m.oneOrMore( num )
		])),
		m.optional( m.sequence([
			m.anyOf( 'eE' ),
			m.optional( m.anyOf( '+-' ) ),
			m.oneOrMore( num )
		]))
	])
);

t.terminals([ ',', ':', '{', '}', '[', ']', '//', '/*', '*/' ]);

t.keywords([ 'true', 'false', 'null' ]);

const c = contextualizer();

c.trackContext( '[', ']' ).allowCaching;
c.trackContext( '{', '}' ).allowCaching;
c.trackContext( '//', token.LineBreakKind ).forceSkip.topContext;
c.trackContext( '/*', '*/' ).forceSkip.topContext;

// const l = lexer( t, c );
//
// const s = syntax( l );
//
// const object = s.rule(
// 	'object',
// 	r.sequence([
// 		r.token( '{' ),
// 		r.zeroOrMore(
//
// 		),
// 		r.recover( r.token( '}' ), 'objects end with }' )
// 	])
// );

console.log( t.tokenize( '{ "name": 5.3e+1 }' ) );
