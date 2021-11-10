#version 300 es
// Указать, что используется WebGL второй версии

// Использовать высокую точность для float
precision highp float;

in vec4 vcolor;

out vec4 fragColor;

void main() {
    fragColor = vcolor;
}
