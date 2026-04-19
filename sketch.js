/**
 * p5_audio_visualizer
 * 這是一個結合 p5.js 與 p5.sound 的程式，載入音樂並循環播放，
 * 畫面上會有多個隨機生成的多邊形在視窗內移動反彈，且其大小會跟隨音樂的振幅（音量）即時縮放。
 */

// 全域變數
let shapes = [];
let bubbles = [];
let song;
let amplitude;

// 外部定義的二維陣列，做為多邊形頂點的基礎座標 (這裡使用一個六邊形作為範例)
let points = [[-3, 5], [3, 7], [1, 5],[2,4],[4,3],[5,2],[6,2],[8,4],[8,-1],[6,0],[0,-3],[2,-6],[-2,-3],[-4,-2],[-5,-1],[-6,1],[-6,2]];

function preload() {
  // 在程式開始前預載入外部音樂資源
  // 請確保 'midnight-quirk-255361.mp3' 檔案存在於專案目錄中
  song = loadSound('midnight-quirk-255361.mp3');
}

function setup() {
  // 初始化畫布，建立符合視窗大小的畫布
  createCanvas(windowWidth, windowHeight);

  // 初始化 p5.Amplitude 物件
  amplitude = new p5.Amplitude();

  // 嘗試播放音樂 (注意：現代瀏覽器通常需要使用者互動後才能播放聲音)
  if (song.isLoaded()) {
    song.loop();
  }

  // 使用 for 迴圈產生 10 個形狀物件
  for (let i = 0; i < 10; i++) {
    // 產生一個隨機的縮放倍率，讓每個形狀大小略有不同，但保持比例
    let s = random(10, 30);
    // 透過 map() 讀取全域陣列 points，轉換為物件格式
    let deformedPoints = points.map(pt => {
      return {
        x: pt[0] * s,
        y: pt[1] * s
      };
    });

    // 定義形狀物件結構
    let shape = {
      x: random(0, windowWidth),      // 初始 X 座標
      y: random(0, windowHeight),     // 初始 Y 座標
      dx: random(-3, 3),              // X 軸水平移動速度
      dy: random(-3, 3),              // Y 軸垂直移動速度
      scale: random(1, 10),           // 縮放比例 (基礎值)
      color: color(random(255), random(255), random(255)), // 隨機生成的 RGB 顏色
      points: deformedPoints          // 變形後的頂點座標
    };

    // 將物件 push 到 shapes 陣列中
    shapes.push(shape);
  }
}

function draw() {
  // 設定背景顏色
  background('#003366');
  
  // 產生氣泡
  if (random(1) < 0.05) { // 每一幀有 5% 機率產生新氣泡
    bubbles.push({
      x: random(width),
      y: height + 10,
      size: random(5, 15),
      speed: random(1, 3),
      popY: random(0, height - 100), // 隨機破裂高度
      popping: false,
      alpha: 150
    });
  }

  // 更新與繪製氣泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    if (!b.popping) {
      b.y -= b.speed;
      b.x += random(-1, 1); // 輕微左右擺動
      if (b.y < b.popY) {
        b.popping = true;
      }
      noStroke();
      fill(255, 255, 255, b.alpha);
      ellipse(b.x, b.y, b.size);
    } else {
      // 破裂效果：變大並消失
      b.size += 1;
      b.alpha -= 10;
      noFill();
      strokeWeight(1);
      stroke(255, 255, 255, b.alpha);
      ellipse(b.x, b.y, b.size);
      if (b.alpha <= 0) {
        bubbles.splice(i, 1);
      }
    }
  }

  // 設定邊框粗細
  strokeWeight(2);

  // 透過 amplitude.getLevel() 取得當前音量大小（數值介於 0 到 1）
  let level = amplitude.getLevel();

  // 使用 map() 將 level 映射到 (0.5, 2) 的範圍，做為音量縮放倍率
  let sizeFactor = map(level, 0, 1, 0.5, 2);

  // 使用 for...of 迴圈走訪 shapes 陣列中的每個 shape 進行更新與繪製
  for (let shape of shapes) {
    // 位置更新
    shape.x += shape.dx;
    shape.y += shape.dy;

    // 邊緣反彈檢查
    if (shape.x < 0 || shape.x > windowWidth) {
      shape.dx *= -1;
    }
    if (shape.y < 0 || shape.y > windowHeight) {
      shape.dy *= -1;
    }

    // 設定外觀
    fill(shape.color);
    stroke(shape.color);

    // 座標轉換與縮放
    push();
    translate(shape.x, shape.y); // 將原點移動到形狀座標
    
    if (shape.dx > 0) {
      scale(-sizeFactor, sizeFactor); // 往右移時左右翻轉
    } else {
      scale(sizeFactor, sizeFactor);  // 往左移時維持原狀
    }

    // 繪製多邊形
    beginShape();
    for (let pt of shape.points) {
      vertex(pt.x, pt.y);
    }
    endShape(CLOSE);

    // 狀態還原
    pop();
  }
}

// 輔助函式：點擊滑鼠以啟動音訊 (解決瀏覽器自動播放限制)
function mousePressed() {
  if (song.isLoaded() && !song.isPlaying()) {
    song.loop();
  }
  userStartAudio();
}

// 輔助函式：視窗大小改變時調整畫布
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
