import * as mat4 from '/libs/gl-matrix/mat4.js'
import loadFile from '/utils/loadFile.js';
import createProgram from '../../../utils/webgl/createProgram.js';

const PATH = '/examples/04_textures';

const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl2');

// Вершины, по которым строится фигура. В данном случае куб
const cubeGeometry = [
	-0.5, -0.5, -0.5,
	0.5, -0.5, -0.5,
	0.5, 0.5, -0.5,
	0.5, 0.5, -0.5,
	-0.5, 0.5, -0.5,
	-0.5, -0.5, -0.5,

	-0.5, -0.5, 0.5,
	0.5, -0.5, 0.5,
	0.5, 0.5, 0.5,
	0.5, 0.5, 0.5,
	-0.5, 0.5, 0.5,
	-0.5, -0.5, 0.5,

	-0.5, 0.5, 0.5,
	-0.5, 0.5, -0.5,
	-0.5, -0.5, -0.5,
	-0.5, -0.5, -0.5,
	-0.5, -0.5, 0.5,
	-0.5, 0.5, 0.5,

	0.5, 0.5, 0.5,
	0.5, 0.5, -0.5,
	0.5, -0.5, -0.5,
	0.5, -0.5, -0.5,
	0.5, -0.5, 0.5,
	0.5, 0.5, 0.5,

	-0.5, -0.5, -0.5,
	0.5, -0.5, -0.5,
	0.5, -0.5, 0.5,
	0.5, -0.5, 0.5,
	-0.5, -0.5, 0.5,
	-0.5, -0.5, -0.5,

	-0.5, 0.5, -0.5,
	0.5, 0.5, -0.5,
	0.5, 0.5, 0.5,
	0.5, 0.5, 0.5,
	-0.5, 0.5, 0.5,
	-0.5, 0.5, -0.5
];

// Соответствие текстурных координат и вершин куба
const textureCoordinates = [
	0.0, 0.0,
	1.0, 0.0,
	1.0, 1.0,
	1.0, 1.0,
	0.0, 1.0,
	0.0, 0.0,

	0.0, 0.0,
	1.0, 0.0,
	1.0, 1.0,
	1.0, 1.0,
	0.0, 1.0,
	0.0, 0.0,

	1.0, 0.0,
	1.0, 1.0,
	0.0, 1.0,
	0.0, 1.0,
	0.0, 0.0,
	1.0, 0.0,

	1.0, 0.0,
	1.0, 1.0,
	0.0, 1.0,
	0.0, 1.0,
	0.0, 0.0,
	1.0, 0.0,

	0.0, 1.0,
	1.0, 1.0,
	1.0, 0.0,
	1.0, 0.0,
	0.0, 0.0,
	0.0, 1.0,

	0.0, 1.0,
	1.0, 1.0,
	1.0, 0.0,
	1.0, 0.0,
	0.0, 0.0,
	0.0, 1.0
];

const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, 45 * Math.PI / 180.0, canvas.width / canvas.height, 0.1, 10);

const viewMatrix = mat4.create();
mat4.lookAt(viewMatrix, [0, 0, 7], [0, 0, 0], [0, 1, 0]);


const cubes = [
	{ modelMatrix: mat4.create(), position: [-2, 0, 0] },
	{ modelMatrix: mat4.create(), position: [0, 0, 0] },
	{ modelMatrix: mat4.create(), position: [2, 0, 0] },
];

// Сохранить вершины куба на ГПУ, чтобы потом эту инфу можно было передать в вершинный шейдер
const geometryBuffer = setupArrayBuffer(cubeGeometry);

// Сохранить координаты текстуры в буффер
const textureCoordinatesBuffer = setupArrayBuffer(textureCoordinates);

async function main() {
	const textureImage = new Image();
	textureImage.src = `${PATH}/images/texture.jpg`;
	const [vertexShaderSource, fragmentShaderSource] = await Promise.all([
		loadFile(`${PATH}/shaders/vertexShader.shader`),
		loadFile(`${PATH}/shaders/fragmentShader.shader`),
		new Promise(res => textureImage.onload = res)
	]);
	const shaderProgram = createProgram(gl, vertexShaderSource, fragmentShaderSource);
	bindShaderAttributes(shaderProgram);

	const projectionMatrixLocation = gl.getUniformLocation(shaderProgram, 'projectionMatrix');
	const viewMatrixLocation = gl.getUniformLocation(shaderProgram, 'viewMatrix');
	const modelMatrixLocations = cubes.map((_, i) => gl.getUniformLocation(shaderProgram, `modelMatrix[${i}]`));
	const sampler0Location = gl.getUniformLocation(shaderProgram, 'sampler0');

	// Выделать участок памяти для текстуры на ГПУ
	const texture = gl.createTexture();
	// Связать гейт с буффером
	gl.bindTexture(gl.TEXTURE_2D, texture);
	// Сохранить текстуру в буффер
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, textureImage);

	// Тип сглаживания при масштабировании текстуры
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); // При увеличении
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // При уменьшении

	// Всего есть 8 текстур, используем первую
	gl.activeTexture(gl.TEXTURE0);
	// Связать гейт с текстурой
	gl.bindTexture(gl.TEXTURE_2D, texture);
	// Связать uniform переменную с первой текстурой TEXTURE0
	gl.uniform1i(sampler0Location, 0);

	gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
	gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);

	let angle = 0;

	gl.enable(gl.DEPTH_TEST);

	requestAnimationFrame(function render() {
		gl.clearColor(0, 1, 0, .1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		angle += 0.01;

		cubes.forEach(({ modelMatrix, position }, i) => {
			mat4.identity(modelMatrix);

			mat4.translate(modelMatrix, modelMatrix, position);
			mat4.rotateX(modelMatrix, modelMatrix, 0.3);
			mat4.rotateY(modelMatrix, modelMatrix, angle*(i+1));

			gl.uniformMatrix4fv(modelMatrixLocations[i], false, modelMatrix);
		});

		gl.drawArraysInstanced(gl.TRIANGLES, 0, cubeGeometry.length / 3, cubes.length);

		requestAnimationFrame(render);
	});
}
main();

function setupArrayBuffer(data) {
	// Выделить участок памяти в ГПУ
	const buffer = gl.createBuffer();

	// Указать в какой буфер посылать данные при пересылке из ЦПУ в ГПУ с помощью гейта ARRAY_BUFFER
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

	// Передать данные в гейт ARRAY_BUFFER. Сохраняет данные на ГПУ
	// STATIC_DRAW - занимает больше времени на пересылку, но кладет ближе к гпу. Использовать при редкой передаче из ЦПУ в ГПУ
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

	return buffer;
}

function bindShaderAttributes(shaderProgram) {
	// Получить адрес атрибута
	const vertexAttributeLocation = gl.getAttribLocation(shaderProgram, 'vertex');
	// Активировать атрибут
	gl.enableVertexAttribArray(vertexAttributeLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, geometryBuffer);
	// Связать буфер с вершинами с атрибутом в вершинном шейдере
	gl.vertexAttribPointer(vertexAttributeLocation, 3, gl.FLOAT, false, 0, 0);

	const textureCoordinateAttributeLocation = gl.getAttribLocation(shaderProgram, 'textureCoordinate');
	gl.enableVertexAttribArray(textureCoordinateAttributeLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordinatesBuffer);
	gl.vertexAttribPointer(textureCoordinateAttributeLocation, 2, gl.FLOAT, false, 0, 0);
}
