// Adapted from Inspira UI's Liquid Logo shader architecture for JetDev's
// fixed-outline navigation mark:
// https://github.com/unovue/inspira-ui/tree/main/app/components/inspira/ui/liquid-logo

export const jetLogoVertexShaderSource = /* glsl */ `#version 300 es
precision highp float;

in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

export const jetLogoFragmentShaderSource = /* glsl */ `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragment_colour;

uniform sampler2D u_mask;
uniform float u_time;
uniform float u_speed;
uniform float u_pattern_scale;
uniform float u_distortion;
uniform float u_highlight_width;
uniform float u_highlight_strength;
uniform float u_shadow_strength;
uniform vec3 u_primary;
uniform vec3 u_secondary;
uniform vec3 u_tertiary;
uniform vec3 u_highlight;
uniform vec3 u_shadow;

const float TAU = 6.283185307179586;
const float PHI = 1.618033988749895;
const float HALF = 0.5;
const float THIRD = 0.333333333333333;

float liquid_field(vec2 point, float time) {
  float first_wave = sin(TAU * (point.x + point.y) + time);
  float second_wave = sin(TAU * (point.y - point.x) - time / PHI);
  return (first_wave + second_wave) * HALF;
}

vec3 brand_gradient(float phase) {
  float colour_phase = phase / THIRD;

  if (colour_phase < 1.0) {
    return mix(u_primary, u_secondary, colour_phase);
  }

  if (colour_phase < 2.0) {
    return mix(u_secondary, u_tertiary, colour_phase - 1.0);
  }

  return mix(u_tertiary, u_primary, colour_phase - 2.0);
}

void main() {
  float mask_alpha = texture(u_mask, v_uv).a;
  float animated_time = u_time * u_speed;
  float liquid = liquid_field(v_uv * u_pattern_scale, animated_time);
  float phase = fract(
    v_uv.x * u_pattern_scale
    + liquid * u_distortion
    + animated_time
  );

  vec3 colour = brand_gradient(phase);

  float highlight_distance = abs(sin(TAU * (phase + liquid * u_distortion)));
  float highlight_mix = (
    1.0 - smoothstep(0.0, u_highlight_width, highlight_distance)
  ) * u_highlight_strength;

  float shadow_distance = abs(
    sin(TAU * (phase + HALF - liquid * u_distortion))
  );
  float shadow_mix = (
    1.0 - smoothstep(0.0, u_highlight_width, shadow_distance)
  ) * u_shadow_strength;

  colour = mix(colour, u_shadow, shadow_mix);
  colour = mix(colour, u_highlight, highlight_mix);

  fragment_colour = vec4(colour, mask_alpha);
}
`
