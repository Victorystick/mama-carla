
export function Token( kind, value, skipped, mutable, indentation ) {
	this.kind = kind;
	this.value = value;
	this.skipped = skipped || false;
	this.mutable = mutable || false;
	this.indentation = indentation || false;
}

export const LineBreakKind = 'lineBreak';
export const UnknownKind = 'unknown';

export function unknown( value ) {
	return new Token( UnknownKind, value );
}

export function lineBreak( value ) {
	return new Token( LineBreakKind, value );
}

export function terminal( value ) {
	return new Token( value, value );
}
