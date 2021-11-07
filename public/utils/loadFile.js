export default async function loadFile (path) {
	return fetch(path)
		.then(response => response.text())
}
