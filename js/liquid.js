/* =========================================================
   Fondo líquido iridiscente (WebGL).
   Si el navegador no tiene WebGL, se queda el degradado de CSS.
   ========================================================= */

(function () {
  "use strict";

  const canvas = document.getElementById("liquid");
  if (!canvas) return;

  const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
  if (!gl) { canvas.remove(); return; }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const vert = `
    attribute vec2 p;
    void main() { gl_Position = vec4(p, 0.0, 1.0); }
  `;

  // Ruido + "domain warping" para el efecto de cromo líquido,
  // coloreado con la paleta de la fiesta.
  const frag = `
    precision mediump float;
    uniform vec2 uRes;
    uniform float uTime;

    vec2 hash(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
    }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(dot(hash(i), f), dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
                 mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
    }
    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
      return v;
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
      vec2 st = uv * 0.55;
      float t = uTime * 0.035;

      vec2 q = vec2(fbm(st * 1.1 + t), fbm(st * 1.1 + vec2(5.2, 1.3) - t));
      vec2 w = vec2(fbm(st * 1.3 + 2.6 * q + vec2(1.7, 9.2) + t * 0.7),
                    fbm(st * 1.3 + 2.6 * q + vec2(8.3, 2.8) - t * 0.5));
      float f = fbm(st * 1.2 + 3.0 * w);

      vec3 night  = vec3(0.043, 0.024, 0.094);
      vec3 plum   = vec3(0.165, 0.059, 0.220);
      vec3 violet = vec3(0.330, 0.170, 0.620);
      vec3 pink   = vec3(0.840, 0.145, 0.596);
      vec3 cyan   = vec3(0.300, 0.780, 1.000);

      vec3 col = mix(night, plum, smoothstep(-0.35, 0.25, f));
      col = mix(col, violet, smoothstep(0.15, 0.65, length(w)) * 0.75);

      // Bandas de brillo tipo cromo
      float band  = sin(f * 9.0 + length(q) * 5.0);
      float glowP = smoothstep(0.55, 1.0, band) * smoothstep(0.15, 0.7, length(w));
      col += pink * glowP * 0.85;
      float bandC = sin(f * 9.0 + length(q) * 5.0 + 1.6);
      col += cyan * smoothstep(0.82, 1.0, bandC) * smoothstep(0.0, 0.5, q.y + 0.2) * 0.45;
      col += vec3(1.0, 0.86, 0.96) * pow(max(band, 0.0), 30.0) * 0.55;

      // Viñeta para que el texto respire
      col *= 1.0 - 0.45 * dot(uv * 0.75, uv * 0.75);
      col = mix(col, night, 0.18);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (err) {
    canvas.remove();
    return;
  }

  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, "uRes");
  const uTime = gl.getUniformLocation(prog, "uTime");

  // Se pinta a media resolución: es un fondo desenfocado y así va fluido en móvil
  const SCALE = 0.5;
  function resize() {
    const w = Math.max(1, Math.round(window.innerWidth * SCALE));
    const h = Math.max(1, Math.round(window.innerHeight * SCALE));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, w, h);
  }

  const start = performance.now() - 40000; // arranca ya "mezclado"
  let raf = 0;

  function draw(now) {
    resize();
    gl.uniform1f(uTime, (now - start) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function loop(now) {
    draw(now);
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener("resize", () => { if (reduceMotion) draw(performance.now()); });

  document.addEventListener("visibilitychange", () => {
    if (reduceMotion) return;
    if (document.hidden) cancelAnimationFrame(raf);
    else raf = requestAnimationFrame(loop);
  });

  if (reduceMotion) draw(performance.now());
  else raf = requestAnimationFrame(loop);
})();
