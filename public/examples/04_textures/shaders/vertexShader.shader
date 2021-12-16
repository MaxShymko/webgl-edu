#version 300 es
// Указать, что используется WebGL второй версии

// in это переменные которые берутся из предыдущего этапа пайплайна
// в данном случае это CPU
in vec3 vertex;
in vec2 textureCoordinate;

// Что будет на выходе шейдера
out vec3 fvertex;
out vec2 ftextureCoordinate;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix[3];

void main() {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix[gl_InstanceID] * vec4(vertex, 1.0);
    fvertex = vertex;
    ftextureCoordinate = textureCoordinate;
}
