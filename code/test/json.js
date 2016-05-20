import assert from 'assert';
import tokenizer from '../src/tokenizer.js';
import contextualizer from '../src/contextualizer.js';
import lexer from '../src/lexer.js';
import syntax from '../src/syntax.js';

import * as m from '../src/matcher.js';
import * as r from '../src/rules.js';

describe( 'JSON', () => {
	const t = tokenizer();

	t.tokenCategory(
		'whitespace',
		m.oneOrMore( m.anyOf( ' \t\f\n' ) )
	);

	t.tokenCategory(
		'string',
		m.sequence([
			m.chunk( '"' ),
			m.zeroOrMore( m.choice([
				m.anyExceptOf( '\n\r\\"' ),
				m.sequence([
					m.chunk( '\\' ),
					m.anyOf( '"\\/bfnrt' )
				]),
				m.sequence([
					m.chunk("\\u"),
					m.repeat(
						m.choice([
							m.rangeOf('a', 'f'),
							m.rangeOf('A', 'F'),
							m.rangeOf('0', '9')
						]),
						4
					)
				])
			])),
			m.chunk( '"' )
		])
	);

	t.tokenCategory(
		'number',
		m.sequence([
			m.optional( m.chunk( '-' ) ),
			m.choice([
				m.chunk( '0' ),
				m.sequence([
					m.rangeOf( '1', '9' ),
					m.zeroOrMore( m.rangeOf( '0', '9' ) )
				])
			]),
			m.optional( m.sequence([
				m.chunk( '.' ),
				m.oneOrMore( m.rangeOf( '0', '9' ) )
			])),
			m.optional( m.sequence([
				m.anyOf( 'eE' ),
				m.optional( m.anyOf( '+-' ) ),
				m.oneOrMore( m.rangeOf( '0', '9' ) )
			]))
		])
	);

	t.terminals([ ',', ':', '{', '}', '[', ']', '//', '/*', '*/' ]),

	t.keywords([ 'true', 'false', 'null' ]);

	const c = contextualizer();

	c.trackContext( '[', ']' ).allowCaching;
	c.trackContext( '{', '}' ).allowCaching;

	const l = lexer( tokenizer, contextualizer );

	const s = syntax( l, s => {
		const object = s.rule( 'object', () =>
			r.sequence([
				r.token( '{' ),
				r.zeroOrMore(
					r.branch( 'entry', entry ),
					r.recover( r.token( ',' ), 'object entries must be separated with ,' )
				),
				r.recover( r.token( '}' ), 'object must end with }' )
			])
		);

		const entry = s.rule( 'entry', () =>
			r.sequence([
				r.capture( 'key', r.token( 'string' ) ),
				r.token( ':' ),
				r.branch( 'value', value )
			])
		);

		const array = s.rule( 'array', () =>
			r.sequence([
				r.token( '[' ),

				r.recover( r.token( ']' ), 'array must end with ]' )
			])
		)
	});

	it( 'parses strings', () => {
		assert.deepEqual(
			t.tokenize( '"fo\\to\\uffff"' ),
			[{
				indentation: false,
				kind: 'string',
				mutable: false,
				skipped: false,
				value: '"fo\\to\\uffff"'
			}]
		);
	});

	it( 'parses numbers', function () {
		assert.deepEqual(
			t.tokenize( '-12e63' ),
			[{
				indentation: false,
				kind: 'number',
				mutable: false,
				skipped: false,
				value: '-12e63'
			}]
		)
	});
});
