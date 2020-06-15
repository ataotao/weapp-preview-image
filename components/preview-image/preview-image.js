const app = getApp();
let touchStartX = 0;//触摸时的原点  
let touchStartY = 0;//触摸时的原点  
let time = 0;// 时间记录，用于滑动时且时间小于1s则执行左右滑动  
let interval = "";// 记录/清理时间记录  
let touchMoveX = 0; // x轴方向移动的距离
let touchMoveY = 0; // y轴方向移动的距离

import { throttle, AutoSize, getSystemInfo } from "./utils";
Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    imgUrls: {
      type: Array,
      value: [],
      observer(newVal = []) {
        const sysInfo = getSystemInfo();
        const { contentWidth, contentHeight, customBar } = sysInfo;
        console.log(sysInfo);
        // this.setData({ _isLoading: true });
        // console.log(11);

        // this.setData({
        //   _currentImgs: newVal.map(v => {
        //     return {
        //       ...v,
        //       imageX: (contentWidth) / 2,
        //       imageY: (contentHeight + customBar) / 2,
        //       orgImageX: (contentWidth) / 2,
        //       orgImageY: (contentHeight + customBar) / 2
        //     }
        //   })
        // }, () => {
        //   this.setData({ _isLoading: false });
        // });
        // 获取图片信息
        this.getImgInfo(this.properties._currentCount, newVal);
      },
    },
    show: {
      type: Boolean,
      value: false,
      observer(newVal) {
        this.setData({ _currentShow: newVal });
      },
    },
    current: {
      type: Number,
      value: 0,
      observer(newVal) {
        this.setData({ _currentCount: newVal });
      },
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    _currentImgs: [],
    _currentShow: false,
    _currentCount: 0,
    _isLoading: false,
    _contentWidth: 0,
    _contentHeight: 0,
    _imageScale: 1,
  },

  // 计算属性
  observers: {
    // 'show'(show) {
    //   // console.log('show', show);
    //   this.setData({ currentShow: show });
    // },
    // 'currentImgs'(currentImgs) {
    //   if (currentImgs.length > 0 ) {
    //     const { currentCount } = this.data;
    //     console.log(currentImgs);
    //       // 获取图片信息
    //       // this.getImgInfo(currentCount);
    //   }
    // }
  },

  lifetimes: {
    attached() {
      // 在组件实例进入页面节点树时执行
      // console.log("attached", this.data);
      const sysInfo = getSystemInfo();
      const { contentWidth, contentHeight, pixelRatio } = sysInfo;
      this.setData({
        _contentWidth: contentWidth,
        _contentHeight: contentHeight,
        _pixelRatio: pixelRatio
      });
      // 节流处理，提升性能
      this.throttleTouchMove = throttle(this.touchMove, 5);
    },
    ready() {
      // console.log('ready');
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
      // console.log('detached');
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 获取图片信息
    async getImgInfo(currentCount, currentImgs) {
      let _currentImgs = [...currentImgs];
      const index = currentCount;
      if (_currentImgs.length > 0 && !_currentImgs[index].width) {
        // 先构造数据，loading生效
        this.setData({
          _currentImgs,
        });
        this.setData({ _isLoading: true });
        for (let i = 0; i < _currentImgs.length; i++) {
          const el = _currentImgs[i];
          _currentImgs[i] = await this.initImgData(el);
        }
        // 赋值生成的图片对象
        this.setData(
          {
            _currentImgs,
          },
          () => {
            this.setData({ _isLoading: false });
          }
        );
      }
    },

    // 初始化图片属性
    initImgData(el) {
      const sysInfo = getSystemInfo();
      const { contentWidth, contentHeight, customBar } = sysInfo;
      return new Promise(async (resolve, reject) => {
        wx.getImageInfo({
          src: el.src,
          success: (imgRes) => {
            const img = AutoSize(imgRes, contentWidth, contentHeight);
            resolve({
              src: el.src,
              title: el.title,
              width: img.width,
              height: img.height,
              imageX: (contentWidth - img.width) / 2,
              imageY: (contentHeight - img.height) / 2,
              orgImageX: (contentWidth - img.width) / 2,
              orgImageY: (contentHeight - img.height) / 2,
            });
          },
          fail: (err) => {
            console.log(err);
            reject(err);
          },
        });
      });
    },

    /** 手势处理 */
    // 触摸开始事件
    touchStart (e) {
      touchStartX = e.touches[0].pageX; // 获取触摸时的原点
      touchStartY = e.touches[0].pageY; // 获取触摸时的原点
      // 使用js计时器记录时间
      interval = setInterval(function () {
        time++;
      }, 100);
    },
    // 触摸移动事件
    touchMove (e) {
      touchMoveX = e.touches[0].pageX;
      touchMoveY = e.touches[0].pageY;
    },
    // 触摸结束事件
    touchEnd (e) {
      var moveX = touchMoveX - touchStartX;
      var moveY = touchMoveY - touchStartY;
      if (Math.sign(moveX) == -1) {
        moveX = moveX * -1;
      }
      if (Math.sign(moveY) == -1) {
        moveY = moveY * -1;
      }
      if (moveX <= moveY) {
        // 上下
        // 向上滑动
        if (touchMoveY - touchStartY <= -30 && time < 10) {
          console.log("向上滑动");
        }
        // 向下滑动
        if (touchMoveY - touchStartY >= 30 && time < 10) {
          console.log("向下滑动 ");
        }
      } else {
        console.log('touchMoveX - touchStartX' ,touchMoveX - touchStartX, touchMoveX, touchStartX);
        console.log('time' ,time);
        // 左右
        // 向左滑动
        if (touchMoveX - touchStartX <= -30 && time < 10) {
          console.log("左滑页面");
          const { _currentImgs, _currentCount } = this.data;
          const current = _currentCount + 1;
          if(current < _currentImgs.length) {
            this.setData({ 
              _currentCount: _currentCount + 1,
              _imageScale: 1
            });
          }
          
        }
        // 向右滑动
        if (touchMoveX - touchStartX >= 30 && time < 10) {
          console.log("向右滑动");
          const { _currentCount } = this.data;
          const current = _currentCount - 1;
          if(current >= 0) {
            this.setData({ 
              _currentCount: current,
              // currentImgs: _currentImgs,
              _imageScale: 1
            });
          }

        }
      }
      clearInterval(interval); // 清除setInterval
      time = 0;
    },
  },
});
