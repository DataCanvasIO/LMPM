export const setName = (name, arr) => {
	const ar = []
	for (let i = 0; i < arr.length; i++) {
		if (arr[i].name.indexOf(name) === name || arr[i].name.split('-')[0] === name) {
			if (arr[i].name.indexOf('-', name.length) !== -1) {
				const num = Number(arr[i].name.split('-')[arr[i].name.split('-').length - 1])
				if (num) {
					ar.push(num)
				}
			} else {
				ar.push(0)
			}
		}
	}
	ar.sort((x, y) => { return y - x })
	console.log(ar)
	return ar[0] || ar[0] === 0 ? `${name}-${ar[0] + 1}` : name
}

export function handleNodeData (data) {
	const { node , ...otherProps } = data
	return otherProps
}