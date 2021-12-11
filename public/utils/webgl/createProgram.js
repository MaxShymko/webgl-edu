import createShader from './createShader.js';

export default function(gl, vertexShaderSource, fragmentShaderSource) {
	const vertexShader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
	const fragmentShader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

	const shaderProgram = gl.createProgram();

	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);

	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		throw new Error(gl.getProgramInfoLog(shaderProgram));
	}

	gl.useProgram(shaderProgram);

	return shaderProgram;
}
