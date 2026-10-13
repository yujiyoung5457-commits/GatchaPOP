(() => {
  const canvas = document.querySelector('.hero-bubbles');
  if (!canvas || !window.WebGLRenderingContext) return;

  const gl = canvas.getContext('webgl', { alpha: true, antialias: true });
  if (!gl) return;

  const vertex = `
    attribute vec2 position;
    void main() { gl_Position = vec4(position, 0.0, 1.0); }
  `;
  const fragment = `
    precision mediump float;
    uniform vec2 resolution;
    uniform float time;

    float sphere(vec2 point, vec2 center, float radius) {
      return length(point - center) - radius;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / resolution;
      uv.x *= resolution.x / resolution.y;
      float aspect = resolution.x / resolution.y;
      vec3 color = vec3(0.0);
      float alpha = 0.0;

      for (int i = 0; i < 14; i++) {
        float n = float(i);
        vec2 center = vec2(
          0.15 + fract(n * 0.191) * (aspect - 0.3) + sin(time * (0.07 + n * 0.006) + n) * 0.045,
          fract(n * 0.347 + time * (0.012 + n * 0.002))
        );
        float radius = 0.018 + fract(n * 0.271) * 0.018;
        float distance = sphere(uv, center, radius);

        if (distance < 0.0) {
          vec2 local = (uv - center) / radius;
          float depth = sqrt(max(0.0, 1.0 - dot(local, local)));
          vec3 normal = normalize(vec3(local, depth));
          vec3 light = normalize(vec3(-0.45, 0.65, 0.9));
          float diffuse = max(dot(normal, light), 0.0);
          float rim = pow(1.0 - depth, 1.45);
          float highlight = pow(max(dot(normal, normalize(vec3(-0.7, 0.8, 1.0))), 0.0), 24.0);
          vec2 glintPosition = vec2(-0.28, 0.34);
          float glint = smoothstep(0.17, 0.0, length(local - glintPosition));
          vec3 bubble = vec3(0.48, 0.83, 1.0) * (0.38 + diffuse * 0.48);
          bubble += vec3(0.82, 0.96, 1.0) * (rim * 0.95 + highlight * 1.2);
          bubble += vec3(1.0) * glint * 1.35;
          float bubbleAlpha = 0.34 + rim * 0.56 + highlight * 0.35 + glint * 0.32;
          color = mix(color, bubble, bubbleAlpha);
          alpha = max(alpha, bubbleAlpha);
        }
      }
      gl_FragColor = vec4(color, alpha);
    }
  `;

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.useProgram(program);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const resolution = gl.getUniformLocation(program, 'resolution');
  const time = gl.getUniformLocation(program, 'time');
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function render(now) {
    gl.uniform2f(resolution, canvas.width, canvas.height);
    gl.uniform1f(time, now * 0.001);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(render);
  }

  new ResizeObserver(resize).observe(canvas);
  resize();
  requestAnimationFrame(render);
})();
