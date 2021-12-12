#version 300 es
// Указать, что используется WebGL второй версии

// Использовать высокую точность для float
precision highp float;

in vec3 vertex_out;

out vec4 fragColor;

void main() {
    fragColor = vec4(vertex_out + 0.5, 1.0);
}
