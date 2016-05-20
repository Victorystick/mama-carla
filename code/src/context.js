import { some, none } from './option.js';

function Context( kind, parent ) {
	this.kind = kind;
	this.parent = parent;
	this.view = kind + parent.map( v => ':' + v.view ).getOrElse( '' );
	this.depth = parent.map( v => v.depth + 1 ).getOrElse( 0 );
}

Context.prototype.branch = function ( kind ) {
	return new Context( kind, some( this ) );
};

Context.prototype.intersect = function ( other ) {
	let first = this;
	let second = other;

	while ( first.depth > second.depth ) {
		first = first.parent.getOrElse( second );
	}

	while ( second.depth > first.depth ) {
		second = second.parent.getOrElse( first );
	}

	while ( first.view !== second.view ) {
		first = first.parent.getOrElse( base );
		second = second.parent.getOrElse( base );
	}

	return first;
};

export default new Context( 0, none );
