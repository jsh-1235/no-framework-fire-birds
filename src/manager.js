import stage from "./stage.js";
import level from "./level.js";
import ball from "./ball.js";

export default class Manager {
  constructor(context, bird, pig, audio) {
    this.timer = null;

    this.context = context;

    this.bird = bird;

    this.pig = pig;

    this.audio = audio;

    this.parameter = {
      velocity: 0,
      angle: 0,
    };

    this.initialize();
  }

  draw() {
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, stage.width, stage.height);

    // this.context.globalCompositeOperation = "destination-over";
    // this.context.fillStyle = "rgba(0, 255, 0, 0.1)";
    // this.context.fillRect(0, 0, stage.width, stage.height);

    this.context.drawImage(this.bird.image, 0, stage.height - this.bird.height);
    this.context.drawImage(this.pig.image, this.pig.x, this.pig.y);

    this.context.beginPath();
    this.context.arc(ball.x, ball.y, ball.radius, 0, 2.0 * Math.PI, true);
    this.context.fillStyle = "orangeRed";
    this.context.closePath();
    this.context.fill();
  }

  getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  initialize() {
    ball.t = 0;

    ball.x = this.bird.width;

    ball.y = stage.height - this.bird.height;

    ball.radius = 10;

    if (level.value === level.previous) {
      this.pig.x = level.x;
      this.pig.y = level.y;
    } else {
      level.x = this.getRandomArbitrary(this.pig.width, stage.width - this.pig.width);
      level.y = this.getRandomArbitrary(this.pig.height, stage.height - this.pig.height);

      this.pig.x = level.x;
      this.pig.y = level.y;

      level.previous = level.value;
    }

    // this.draw();
  }

  control() {
    this.draw();

    const barWidth = this.parameter.velocity * 5;
    const barHeight = 4;
    const rect = { x: this.bird.width - barWidth + barWidth, y: stage.height - this.bird.height, width: barWidth * 2, height: barHeight };

    this.context.fillStyle = "rgba(255, 255, 0, 0.5)";
    this.context.fillRect(rect.x, rect.y - barHeight / 2, rect.width, rect.height);

    this.context.translate(rect.x + rect.width / 2 - barWidth, rect.y + rect.height / 2 - barHeight / 2);
    this.context.rotate(((180 - this.parameter.angle) * Math.PI) / 180);
    this.context.translate(-rect.x - rect.width / 2 - barWidth, -rect.y - rect.height / 2);

    this.context.fillStyle = "rgba(255, 255, 0, 0.75)";
    this.context.fillRect(rect.x, rect.y, rect.width, rect.height);

    console.log(this.parameter.velocity, this.parameter.angle, (this.parameter.angle * Math.PI) / 180);
  }

  launch(self) {
    console.log("launch");

    self.disabled = true;

    this.initialize();

    ball.velocity = Number(document.getElementById("inputVelocity").value);
    ball.angle = Number(document.getElementById("inputAngle").value);
    var radian = (ball.angle * Math.PI) / 180;

    ball.vx = ball.velocity * Math.cos(radian);
    ball.vy = ball.velocity * Math.sin(radian);

    this.draw();

    // this.timer = setInterval(this.run, 10);

    this.timer = setInterval(() => {
      this.run();
    }, 10);

    this.audio.shot.currentTime = 0;

    this.audio.shot.play();
  }

  run() {
    ball.x += ball.vx * ball.t;

    ball.y += -(ball.vy * ball.t - 0.5 * 9.81 * Math.pow(ball.t, 2));

    ball.t += 0.01;

    console.log("time", ball.t);

    if (ball.x < 0 || ball.x >= stage.width || ball.y < 0 || ball.y >= stage.height) {
      this.stop();
    } else {
      if (ball.x >= this.pig.x && ball.y >= this.pig.y && ball.x <= this.pig.x + this.pig.width && ball.y <= this.pig.y + this.pig.height) {
        document.getElementById("level").innerHTML = "LEVEL " + ++level.value;

        const progressbar = document.querySelector(".progress-bar");

        progressbar.style.width = level.value * 10 + "%";

        progressbar.textContent = level.value;

        if (!this.audio.crash.paused || this.audio.crash.currentTime > 0 || !this.audio.crash.ended) {
          this.audio.crash.pause();
        }

        this.audio.crash.play();

        this.stop();
      }
    }

    this.draw();
  }

  stop() {
    clearInterval(this.timer);

    if (!this.audio.shot.paused || this.audio.shot.currentTime > 0 || !this.audio.shot.ended) {
      this.audio.shot.pause();
    }

    document.getElementById("btnLaunch").disabled = false;

    this.initialize();

    console.log("stop");
  }
}
