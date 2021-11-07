import loadFile from '/utils/loadFile.js';

const PATH = '/examples/01_triangle';

const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl2');

async function main() {
	// Создать массив вершин на ЦПУ
	const triangleVertices = [
		1.0, -1.0, 0.0,
		0.0, 1.0, 0.0,
		-1.0, -1.0, 0.0
	];

	const triangleColors = [
		1.0, 0.0, 0.0, 1.0, // RGBA for the first vertex
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0
	];



	// ======[Создание буфера для вершин]======

	// Выделить участок памяти в ГПУ для вершин
	const triangleVertexPositionBuffer = gl.createBuffer();

	// Указать в какой буфер посылать данные при пересылке из ЦПУ в ГПУ с помощью гейта ARRAY_BUFFER
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);

	// Передать данные в гейт ARRAY_BUFFER.
	// STATIC_DRAW - занимает больше времени на пересылку, но кладет ближе к гпу. Использовать при редкой передаче из ЦПУ в ГПУ
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);



	// ======[Создание буфера для цветов]======

	// Выделить участок памяти в ГПУ для цветов
	const triangleVertexColorBuffer = gl.createBuffer();

	// Переназначить указатель гейта ARRAY_BUFFER на новый буфер для цветов
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);

	// Загрузить данный цветов в созданный буфер для цветов
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleColors), gl.STATIC_DRAW);



	// ======[Загрузка и компиляция цейдеров]======

	const [vertexShaderSource, fragmentShaderSource] = await Promise.all([
		loadFile(`${PATH}/shaders/vertexShader.shader`),
		loadFile(`${PATH}/shaders/fragmentShader.shader`)
	]);
	const vertexShader = setupShader(vertexShaderSource, gl.VERTEX_SHADER);
	const fragmentShader = setupShader(fragmentShaderSource, gl.FRAGMENT_SHADER);



	// ======[Создание и использование программы на ГПУ из шейдеров]======

	// Создать программу. Программа - это комбинация двух шейдеров
	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);

	// Линковка шейдеров в одну программу
	gl.linkProgram(shaderProgram);

	// Проверка на ошибку линковки
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		throw new Error(gl.getProgramInfoLog(shaderProgram));
	}

	// Устанавливает программу как часть рендеринг пайплайна
	gl.useProgram(shaderProgram);



	// ======[Связвание in переменных вершинного шейдера и буферов на ГПУ]======

	// Получить адрес атрибута
	const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'position');
	// Активировать атрибут
	gl.enableVertexAttribArray(positionAttributeLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	// Связать буфер с вершинами с атрибутом в вершинном шейдере
	gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

	// Получить адрес атрибута
	const colorAttributeLocation = gl.getAttribLocation(shaderProgram, 'color');
	// Активировать атрибут
	gl.enableVertexAttribArray(colorAttributeLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
	// Связать буфер с цветами с атрибутом в вершинном шейдере
	gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);



	requestAnimationFrame(function render() {
		// Установить цвет, в который будут перекрашиваться пиксели при gl.clear
		gl.clearColor(0, 1, 0, .1);

		// Перекрасить каждый пиксель в цвет установленный в gl.clearColor
		gl.clear(gl.COLOR_BUFFER_BIT);

		// Отрендерить вершины как треугольник
		gl.drawArrays(gl.TRIANGLES, 0, 3);

		requestAnimationFrame(render);
	});
}
main();

function setupShader(shaderSource, shaderType) {
	const shader = gl.createShader(shaderType);
	gl.shaderSource(shader, shaderSource.trim());
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error(gl.getShaderInfoLog(shader));
	}

	return shader;
}
