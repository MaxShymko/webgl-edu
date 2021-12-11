export default function (gl, shaderSource, shaderType) {
	const shader = gl.createShader(shaderType);

	gl.shaderSource(shader, shaderSource.trim());
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error(gl.getShaderInfoLog(shader));
	}

	return shader;
}
