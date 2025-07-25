function showLetter() {
  document.getElementById("popup").style.display = "flex";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

window.addEventListener("DOMContentLoaded", function () {
  const music = document.getElementById("bg-music");

  document.body.addEventListener(
    "click",
    () => {
      music.play().catch(() => {
        console.log("Trình duyệt chặn tự động phát nhạc.");
      });
    },
    { once: true }
  );
});

var settings = {
  particles: {
    length: 2000,
    duration: 2,
    velocity: 100,
    effect: -1.3,
    size: 13,
  },
};

(function () {
  var b = 0;
  var c = ["ms", "moz", "webkit", "o"];
  for (var a = 0; a < c.length && !window.requestAnimationFrame; ++a) {
    window.requestAnimationFrame = window[c[a] + "RequestAnimationFrame"];
    window.cancelAnimationFrame =
      window[c[a] + "CancelAnimationFrame"] ||
      window[c[a] + "CancelRequestAnimationFrame"];
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (h, e) {
      var d = new Date().getTime();
      var f = Math.max(0, 16 - (d - b));
      var g = window.setTimeout(function () {
        h(d + f);
      }, f);
      b = d + f;
      return g;
    };
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (d) {
      clearTimeout(d);
    };
  }
})();

var Point = (function () {
  function Point(x, y) {
    this.x = typeof x !== "undefined" ? x : 0;
    this.y = typeof y !== "undefined" ? y : 0;
  }
  Point.prototype.clone = function () {
    return new Point(this.x, this.y);
  };
  Point.prototype.length = function (length) {
    if (typeof length == "undefined")
      return Math.sqrt(this.x * this.x + this.y * this.y);
    this.normalize();
    this.x *= length;
    this.y *= length;
    return this;
  };
  Point.prototype.normalize = function () {
    var length = this.length();
    this.x /= length;
    this.y /= length;
    return this;
  };
  return Point;
})();

var Particle = (function () {
  function Particle() {
    this.position = new Point();
    this.velocity = new Point();
    this.acceleration = new Point();
    this.age = 0;
  }
  Particle.prototype.initialize = function (x, y, dx, dy) {
    this.position.x = x;
    this.position.y = y;
    this.velocity.x = dx;
    this.velocity.y = dy;
    this.acceleration.x = dx * settings.particles.effect;
    this.acceleration.y = dy * settings.particles.effect;
    this.age = 0;
  };
  Particle.prototype.update = function (deltaTime) {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.velocity.x += this.acceleration.x * deltaTime;
    this.velocity.y += this.acceleration.y * deltaTime;
    this.age += deltaTime;
  };
  Particle.prototype.draw = function (context, image) {
    function ease(t) {
      return --t * t * t + 1;
    }
    var size = image.width * ease(this.age / settings.particles.duration);
    context.globalAlpha = 1 - this.age / settings.particles.duration;
    context.drawImage(
      image,
      this.position.x - size / 2,
      this.position.y - size / 2,
      size,
      size
    );
  };
  return Particle;
})();

var ParticlePool = (function () {
  var particles,
    firstActive = 0,
    firstFree = 0,
    duration = settings.particles.duration;

  function ParticlePool(length) {
    particles = new Array(length);
    for (var i = 0; i < particles.length; i++) particles[i] = new Particle();
  }
  ParticlePool.prototype.add = function (x, y, dx, dy) {
    particles[firstFree].initialize(x, y, dx, dy);
    firstFree++;
    if (firstFree == particles.length) firstFree = 0;
    if (firstActive == firstFree) firstActive++;
    if (firstActive == particles.length) firstActive = 0;
  };
  ParticlePool.prototype.update = function (deltaTime) {
    var i;
    if (firstActive < firstFree) {
      for (i = firstActive; i < firstFree; i++) particles[i].update(deltaTime);
    }
    if (firstFree < firstActive) {
      for (i = firstActive; i < particles.length; i++)
        particles[i].update(deltaTime);
      for (i = 0; i < firstFree; i++) particles[i].update(deltaTime);
    }
    while (particles[firstActive].age >= duration && firstActive != firstFree) {
      firstActive++;
      if (firstActive == particles.length) firstActive = 0;
    }
  };
  ParticlePool.prototype.draw = function (context, image) {
    var i;
    if (firstActive < firstFree) {
      for (i = firstActive; i < firstFree; i++)
        particles[i].draw(context, image);
    }
    if (firstFree < firstActive) {
      for (i = firstActive; i < particles.length; i++)
        particles[i].draw(context, image);
      for (i = 0; i < firstFree; i++) particles[i].draw(context, image);
    }
  };
  return ParticlePool;
})();

(function (canvas) {
  var context = canvas.getContext("2d"),
    particles = new ParticlePool(settings.particles.length),
    particleRate = settings.particles.length / settings.particles.duration,
    time;

  function pointOnHeart(t) {
    return new Point(
      160 * Math.pow(Math.sin(t), 3),
      130 * Math.cos(t) -
        50 * Math.cos(2 * t) -
        20 * Math.cos(3 * t) -
        10 * Math.cos(4 * t) +
        25
    );
  }

  var image = (function () {
    var canvas = document.createElement("canvas"),
      context = canvas.getContext("2d");
    canvas.width = settings.particles.size;
    canvas.height = settings.particles.size;
    function to(t) {
      var point = pointOnHeart(t);
      point.x =
        settings.particles.size / 2 + (point.x * settings.particles.size) / 350;
      point.y =
        settings.particles.size / 2 - (point.y * settings.particles.size) / 350;
      return point;
    }
    context.beginPath();
    var t = -Math.PI;
    var point = to(t);
    context.moveTo(point.x, point.y);
    while (t < Math.PI) {
      t += 0.01;
      point = to(t);
      context.lineTo(point.x, point.y);
    }
    context.closePath();
    context.fillStyle = "#61c2f3";
    context.fill();
    var image = new Image();
    image.src = canvas.toDataURL();
    return image;
  })();

  function render() {
    requestAnimationFrame(render);
    var newTime = new Date().getTime() / 1000,
      deltaTime = newTime - (time || newTime);
    time = newTime;
    context.clearRect(0, 0, canvas.width, canvas.height);
    var amount = particleRate * deltaTime;
    for (var i = 0; i < amount; i++) {
      var pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
      var dir = pos.clone().length(settings.particles.velocity);
      particles.add(
        canvas.width / 2 + pos.x,
        canvas.height / 2 - pos.y,
        dir.x,
        -dir.y
      );
    }
    particles.update(deltaTime);
    particles.draw(context, image);
  }

  function onResize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }
  window.onresize = onResize;
  setTimeout(function () {
    onResize();
    render();
  }, 10);
})(document.getElementById("pinkboard"));

// Lấy canvas và context
const canvas = document.getElementById("confetti-canvas");
const ctx = canvas.getContext("2d");

// Thiết lập kích thước canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Số lượng confetti
const confettiCount = 300;
const confetti = [];

// Hàm để tạo màu ngẫu nhiên cho confetti
function randomColor() {
  const colors = ["#fce18a", "#ff726d", "#b48def", "#f4306d", "#85e3ff"];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Tạo các mảnh confetti ngẫu nhiên
for (let i = 0; i < confettiCount; i++) {
  confetti.push({
    x: Math.random() * canvas.width, // Vị trí ngang ngẫu nhiên
    y: Math.random() * canvas.height - canvas.height, // Vị trí dọc ngẫu nhiên
    r: Math.random() * 6 + 4, // Kích thước ngẫu nhiên
    d: Math.random() * confettiCount, // Độ chậm ngẫu nhiên
    color: randomColor(), // Màu sắc
    tilt: Math.floor(Math.random() * 10) - 10, // Góc nghiêng ngẫu nhiên
  });
}

// Hàm vẽ confetti
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Xóa canvas trước khi vẽ lại
  confetti.forEach((c) => {
    ctx.beginPath();
    ctx.lineWidth = c.r / 2;
    ctx.strokeStyle = c.color;
    ctx.moveTo(c.x + c.tilt + c.r / 4, c.y);
    ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r);
    ctx.stroke();
  });
  update();
}

// Hàm cập nhật vị trí các mảnh confetti
function update() {
  confetti.forEach((c, i) => {
    c.y += Math.cos(c.d) + 0.2 + c.r / 2; // Điều chỉnh chuyển động rơi
    c.x += Math.sin(c.d); // Điều chỉnh chuyển động ngang

    // Nếu confetti rơi ra ngoài màn hình, tạo lại nó từ trên
    if (c.y > canvas.height) {
      confetti[i].y = -10;
      confetti[i].x = Math.random() * canvas.width;
    }
  });
}

// Hàm tạo vòng lặp vẽ liên tục
function loop() {
  draw();
  requestAnimationFrame(loop);
}

function update() {
  confetti.forEach((c, i) => {
    // Làm chậm tốc độ rơi
    c.y += Math.cos(c.d) + 0.1 + c.r / 2; // Giảm tốc độ rơi xuống bằng cách thay đổi giá trị 1.5 thành 0.5
    c.x += Math.sin(c.d);

    if (c.y > canvas.height) {
      confetti[i].y = -10;
      confetti[i].x = Math.random() * canvas.width;
    }
  });
}

// Bắt đầu vòng lặp vẽ
loop();
