function blank() {
	return Object.create( null );
}

export function StringMap() {
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

export function StringSet( arr ) {
	const map = new StringMap();
	map.add = name => map.put( name, null );
	map.toList = () => Object.keys( map.data );

	( arr || [] ).forEach( map.add );

	return map;
}
