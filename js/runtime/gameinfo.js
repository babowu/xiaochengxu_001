import Emitter from '../libs/tinyemitter';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import { musicInstance } from './music';

const atlas = wx.createImage();
atlas.src = 'images/Common.png';

// 从poems.json文件中读取古诗内容并解析为POEMS数组
const loadPoems = () => {
  return new Promise((resolve) => {
    wx.request({
      url: 'https://your-backend-api.com/poems',
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data && Array.isArray(res.data)) {
          resolve(res.data);
        } else {
          console.error('Failed to load poems from API:', res);
          resolve([
            {
              title: "《题临安邸》",
              author: "宋·林升",
              content: "山外青山楼外楼，西湖歌舞几时休？\n暖风熏得游人醉，直把杭州作汴州。",
              audio: "audio/poem1.wav"
            }
          ]);
        }
      },
      fail: (err) => {
        console.error('Failed to fetch poems from API:', err);
        resolve([
          {
            title: "《题临安邸》",
            author: "宋·林升",
            content: "山外青山楼外楼，西湖歌舞几时休？\n暖风熏得游人醉，直把杭州作汴州。",
            audio: "audio/poem1.wav"
          }
        ]);
      }
    });
  });
};

const POEMS = loadPoems();

export default class GameInfo extends Emitter {
  constructor() {
    super();

    this.btnArea = {
      startX: SCREEN_WIDTH / 2 - 40,
      startY: SCREEN_HEIGHT / 2 - 100 + 180,
      endX: SCREEN_WIDTH / 2 + 50,
      endY: SCREEN_HEIGHT / 2 - 100 + 255,
    };

    this.currentPoem = null;
    this.audioContext = null;

    wx.onTouchStart(this.touchEventHandler.bind(this));
  }

  setFont(ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
  }

  render(ctx) {
    this.renderGameScore(ctx, GameGlobal.databus.score);

    if (GameGlobal.databus.isGameOver) {
      this.renderGameOver(ctx, GameGlobal.databus.score);
    }
  }

  renderGameScore(ctx, score) {
    this.setFont(ctx);
    ctx.fillText(score, 10, 30);
  }

  renderGameOver(ctx, score) {
    if (!this.currentPoem) {
      musicInstance.bgmAudio.pause();
      this.currentPoem = POEMS[Math.floor(Math.random() * POEMS.length)];

      // 检查currentPoem是否包含text字段
      if (!this.currentPoem || !this.currentPoem.text) {
        this.drawRestartButton(ctx);
        return;
      }

      // 延迟两秒播放古诗音频
      setTimeout(() => {
        this.audioContext = wx.createInnerAudioContext();
        this.audioContext.src = this.currentPoem.audio;
        this.audioContext.play();
        this.audioContext.onEnded(() => {
          this.drawRestartButton(ctx);
        });
      }, 2000);
    }

    this.drawGameOverImage(ctx);
    this.drawGameOverText(ctx, score);
    this.drawPoem(ctx);
  }

  drawPoem(ctx) {
    // 检查currentPoem和text字段是否存在
    if (!this.currentPoem || !this.currentPoem.text) {
      ctx.fillText('古诗内容加载失败', SCREEN_WIDTH / 2 - 50, SCREEN_HEIGHT / 2);
      return;
    }

    this.setFont(ctx);
    const lines = this.currentPoem.text.split('\n');
    const poemHeight = lines.length * 30;
    const boxHeight = Math.max(300, poemHeight + 100);

    // 动态调整提示框大小
    ctx.drawImage(
      atlas,
      0,
      0,
      119,
      108,
      SCREEN_WIDTH / 2 - 150,
      SCREEN_HEIGHT / 2 - boxHeight / 2,
      300,
      boxHeight
    );

    lines.forEach((line, index) => {
      const textWidth = ctx.measureText(line).width;
      const x = index < 2 ? SCREEN_WIDTH / 2 - textWidth / 2 : SCREEN_WIDTH / 2 - 100;
      ctx.fillText(
        line,
        x,
        SCREEN_HEIGHT / 2 - boxHeight / 2 + 50 + (index * 30)
      );
    });
  }

  drawGameOverImage(ctx) {
    // 已合并到drawPoem方法中
  }

  drawGameOverText(ctx, score) {
    this.setFont(ctx);
    ctx.fillText(
      '游戏结束',
      SCREEN_WIDTH / 2 - 40,
      SCREEN_HEIGHT / 2 - 100 + 50
    );
    ctx.fillText(
      `得分: ${score}`,
      SCREEN_WIDTH / 2 - 40,
      SCREEN_HEIGHT / 2 - 100 + 130
    );
  }

  drawRestartButton(ctx) {
    ctx.drawImage(
      atlas,
      120,
      6,
      39,
      24,
      SCREEN_WIDTH / 2 - 60,
      SCREEN_HEIGHT / 2 - 100 + 180,
      120,
      40
    );
    ctx.fillText(
      '重新开始',
      SCREEN_WIDTH / 2 - 40,
      SCREEN_HEIGHT / 2 - 100 + 205
    );
  }

  touchEventHandler(event) {
    const { clientX, clientY } = event.touches[0];

    if (GameGlobal.databus.isGameOver && this.currentPoem && this.audioContext && this.audioContext.paused) {
      if (
        clientX >= this.btnArea.startX &&
        clientX <= this.btnArea.endX &&
        clientY >= this.btnArea.startY &&
        clientY <= this.btnArea.endY
      ) {
        this.emit('restart');
        this.currentPoem = null;
        this.audioContext = null;
      }
    }
  }
}
