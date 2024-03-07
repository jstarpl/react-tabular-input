export function arrayRange(start: number, stop: number, step = 1): number[] {
	const arr: number[] = [];
	const diff = Math.abs(stop - start);

	for (let i = 0; i < diff; i++) {
		arr[i] = start + i * step;
	}

	return arr;
}

export function assertNever(test: never): void {
	return test;
}
