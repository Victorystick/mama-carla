export default function signal() {
	const o = Object.create( signalDelegate );
	o.slots = Object.create( null );
	return o;
}

const signalDelegate = {
	
};
