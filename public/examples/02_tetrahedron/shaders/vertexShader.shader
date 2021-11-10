#version 300 es
// Указать, что используется WebGL второй версии

// in это переменные которые берутся из предыдущего этапа пайплайна
// в данном случае это CPU
in vec3 position;
in vec4 color;

// Что будет на выходе шейдера
out vec4 vcolor;

uniform mat4 ry;
uniform mat4 rx;

void main() {
    // Матрицы rx и ry должны перемножаться на JS чтобы уменьшить количество операций в шейдере
    gl_Position = rx * ry * vec4(position, 1.0);
    vcolor = color;
}
