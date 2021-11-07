#version 300 es
// Указать, что используется WebGL второй версии

// in это переменные которые берутся из предыдущего этапа пайплайна
// в данном случае это CPU
in vec3 position;
in vec4 color;

// Что будет на выходе шейдера
out vec4 fcolor;

const float scale = 1.0;
const float tx = .0;
const float ty = .0;

mat4 scaleMt = mat4(
    scale, .0, .0, .0,
    .0, scale, .0, .0,
    .0, .0, .0, .0,
    tx, ty, .0, 1.0
);

void main() {
    gl_Position = scaleMt * vec4(position, 1.0);
    fcolor = color;
}
