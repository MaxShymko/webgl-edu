#version 300 es
// Указать, что используется WebGL второй версии

// in это переменные которые берутся из предыдущего этапа пайплайна
// в данном случае это CPU
in vec3 vertex;

// Что будет на выходе шейдера
out vec3 vertex_out;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix[3];

void main() {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix[gl_InstanceID] * vec4(vertex, 1.0);
    vertex_out = vertex;
}
