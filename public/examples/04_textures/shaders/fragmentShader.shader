#version 300 es
// Указать, что используется WebGL второй версии

// Использовать высокую точность для float
precision highp float;

in vec3 fvertex;
in vec2 ftextureCoordinate;

uniform sampler2D sampler0;

out vec4 fragColor;

void main() {
    fragColor = texture(sampler0, ftextureCoordinate);
}
