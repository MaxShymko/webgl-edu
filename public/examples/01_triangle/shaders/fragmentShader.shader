#version 300 es
// Указать, что используется WebGL второй версии

// Использовать высокую точность для float
precision highp float;

in vec4 fcolor;

out vec4 c;

void main() {
    c = fcolor;
}
