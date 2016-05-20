import { some, none } from './option.js';
import base from './context.js';
import { EnterContext, LeaveContext } from './seam.js';


export default function contextualizer() {
	const _pairs = [];
	let stateMachineCache = none;

	function tokenPairDefinition( open, close, context ) {
		return {
			top: false,

			get topContext() {
				this.top = true;
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

	function stateMachine() {
		if ( stateMachineCache.isNone ) {
			let stateMachine = [];

			for ( const first of _pairs ) {
				stateMachine.push( [ first.open, 0, EnterContext, first.context ] );
				stateMachine.push( [ first.close, first.context, LeaveContext, -1 ] );

				if ( first.open !== first.close ) {
					if ( !first.top ) {
						stateMachine.push( [ first.open, first.context, EnterContext, first.context ] );
					}
					if ( first.close !== token.LineBreakKind ) {
						stateMachine.push( [ first.close, 0, UnexpectedSeam, -1 ] );
					}
				}

				for ( const second of _pairs ) {

				}
			}

			const result = stateMachine.groupBy( zeroth )
				.mapValues( list =>
					list.groupBy( first )
						.mapValues( list => list[ 0 ].slice( 2 ) ) );

			stateMachineCache = some( result );
		}

		return stateMachineCache.getOrElse();
	}

	function contextualize( entry, tokens ) {
		const stateMachine = stateMachine();
		let context = entry;

		for (const token of tokens) {
			const next = stateMachine.get( token.kind )
				.flatMap( _ => _.get( context.kind ) )
				.orElse( pair( RegularSeam, 0 ) );

			token.seam = next[ 0 ];

			switch ( token[ 0 ] ) {
				case EnterContext:
					context = context.branch( next[ 1 ] );
					token.context = context;
					break;

				case LeaveContext:
					token.context = context;
					context = context.parent.getOrElse( base );
					break;

				default:
					token.context = context;
			}
		}

		return context;
	}

	return { trackContext, contextualize };
};
