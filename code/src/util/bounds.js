
const boundsDelegate = {

};

export default function bounds( start, end ) {
	const o = Object.create( boundsDelegate );

	o.defined = start <= end;
	o.length = end - start;

	return o;
}

export const undefined = bounds( 0, -1 );

export function point( pos ) {
	return bounds( pos, pos + 1 );
}

export function cursor( pos ) {
	return bounds( pos, pos );
}
