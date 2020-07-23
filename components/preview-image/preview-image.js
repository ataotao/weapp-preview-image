const app = getApp();
import _Touch from "/touch";
import { throttle, AutoSize, getSystemInfo } from "./utils";
let touchStartX = 0; //触摸时的原点
let touchStartY = 0; //触摸时的原点
let time = 0; // 时间记录，用于滑动时且时间小于1s则执行左右滑动
let interval = ""; // 记录/清理时间记录
let touchMoveX = 0; // x轴方向移动的距离
let touchMoveY = 0; // y轴方向移动的距离
let hypotenuseLength = 0; // 双指触摸时斜边长度
let operateType = null; // 移动/拖动类型 move | zoom
let lastTapTime = 0; // 双击判断
const MIN_SCALE = 1; // 最小缩放值
const MAX_SCALE = 2; // 最大缩放值

const initData = {
  _currentImgs: [],
  _currentShow: false,
  _currentCount: 0,
  _isLoading: false,
  _contentWidth: 0,
  _contentHeight: 0,
  _imageScale: 1,
  _arrowVisible: false,
};

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
  data: initData,

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
      const { contentWidth, contentHeight, pixelRatio, customBar } = sysInfo;
      this.setData({
        _contentWidth: contentWidth,
        _contentHeight: contentHeight,
        _pixelRatio: pixelRatio,
        _customBar: customBar,
      });
      // 节流处理，提升性能
      this.throttlePressMove = throttle(this.pressMove.bind(this), 20);

      new _Touch(this, "touchInit", {
        //会创建this.touch1指向实例对象
        touchStart: (evt) => {
          touchStartX = evt.touches[0].pageX; // 获取触摸时的原点
          touchStartY = evt.touches[0].pageY; // 获取触摸时的原点
        },
        touchMove: () => {},
        touchEnd: () => {},
        touchCancel: () => {},
        //一个手指以上触摸屏幕触发
        multipointStart: () => {
          // console.log("multipointStart");
        },
        //当手指离开，屏幕只剩一个手指或零个手指触发(一开始只有一根手指也会触发)
        multipointEnd: () => {
          // console.log("multipointEnd");
        },
        //点按触发，覆盖下方3个点击事件，doubleTap时触发2次
        tap: () => {
          // console.log("Tap");
          // 左右箭头显示状态
          this.setData({
            _arrowVisible: !this.data._arrowVisible,
          });
        },
        //双击屏幕触发
        doubleTap: () => {
          // console.log("doubleTap");
          const { _imageScale, _currentImgs } = this.data;
          this.setData({
            _imageScale: _imageScale > MIN_SCALE ? MIN_SCALE : MAX_SCALE,
            _currentImgs: _currentImgs.map((v) => ({
              ...v,
              imageX: v.orgImageX,
              imageY: v.orgImageY,
            })),
          });
        },
        //长按屏幕750ms触发
        longTap: () => {
          // console.log("longTap");
        },
        //单击屏幕触发，包括长按
        singleTap: () => {
          // console.log("singleTap");
        },
        //evt.angle代表两个手指旋转的角度
        rotate: (evt) => {
          // console.log("rotate:" + evt.angle);
        },
        //evt.zoom代表两个手指缩放的比例(多次缩放的累计值),evt.singleZoom代表单次回调中两个手指缩放的比例
        pinch: (evt) => {
          // console.log("pinch:" + evt.zoom);
          const { _currentImgs } = this.data;
          let scale = evt.zoom;
          if (scale >= MAX_SCALE) {
            scale = MAX_SCALE;
          } else if (scale <= MIN_SCALE) {
            scale = MIN_SCALE;
          }

          // console.log('scale', scale);
          // 根据实际的缩放量，重置累计值
          this.touchInit.tempZoom = scale;
          // console.log("scale", scale);
          let obj = {
            _imageScale: scale,
          };
          if (scale === 1) {
            // 重置中心轴
            obj._currentImgs = _currentImgs.map((v) => (v.imageX !== v.orgImageX || v.imageY !== v.orgImageY ? { ...v, imageX: v.orgImageX, imageY: v.orgImageY } : v));
          }
          this.setData(obj);
        },
        //evt.deltaX和evt.deltaY代表在屏幕上移动的距离,evt.target可以用来判断点击的对象
        pressMove: this.throttlePressMove,
        swipe: (evt) => {
          //在touch结束触发，evt.direction代表滑动的方向 ['Up','Right','Down','Left']
          console.log("swipe:" + evt.direction);
          const { _currentCount, _currentImgs, _imageScale } = this.data;
          let current = 0;
          switch (evt.direction) {
            // 左滑页面
            case "Left":
              current = _currentCount + 1;
              if (current < _currentImgs.length) {
                if ((operateType === "move" && _currentImgs[_currentCount].isEdeg) || _imageScale === 1) {
                  console.log("Left operateType === move || _imageScale === 1");
                  this.setData(
                    {
                      _currentImgs: _currentImgs.map((v) => (v.imageX !== v.orgImageX || v.imageY !== v.orgImageY ? { ...v, isEdeg: false, imageX: v.orgImageX, imageY: v.orgImageY } : v)),
                      _currentCount: _currentCount + 1,
                      _imageScale: 1,
                      isEdeg: false
                    },
                    () => {
                      operateType = null;
                    }
                  );
                }
              }
              break;
            // 右滑页面
            case "Right":
              current = _currentCount - 1;
              if (current >= 0) {
                if ((operateType === "move" && _currentImgs[_currentCount].isEdeg) || _imageScale === 1) {
                  console.log("Right operateType === move || _imageScale === 1");
                  this.setData(
                    {
                      _currentImgs: _currentImgs.map((v) => (v.imageX !== v.orgImageX || v.imageY !== v.orgImageY ? { ...v, isEdeg: false, imageX: v.orgImageX, imageY: v.orgImageY } : v)),
                      _currentCount: current,
                      _imageScale: 1
                    },
                    () => {
                      operateType = null;
                    }
                  );
                }
              }
              break;
            // 下滑页面
            case "Down":
              if(operateType === 'down') {
                operateType = null;
                this.hideGallery();
              }
              break;
              
            default:
              break;
          }
        },
      });
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
    pressMove(evt) {
      touchMoveX = evt.touches[0].pageX;
      touchMoveY = evt.touches[0].pageY;
      const { _currentCount, _currentImgs, _imageScale, _contentWidth, _contentHeight } = this.data;
      let img_width = _currentImgs[_currentCount].width * _imageScale;
      let img_height = _currentImgs[_currentCount].height * _imageScale;
      let translateX = -(touchStartX - touchMoveX) + _currentImgs[_currentCount].imageX;
      let translateY = -(touchStartY - touchMoveY) + _currentImgs[_currentCount].imageY;
      operateType = null;
      
      if(_imageScale === 1 && touchMoveY > touchStartY) {
        _currentImgs[_currentCount].imageY = translateY;
        operateType = 'down';
        this.setData({
          _currentImgs,
        });
      }
      
      touchStartX = touchMoveX;
      touchStartY = touchMoveY;

      if (_imageScale > 1) {

        // 图片大于画布宽度才可左右拖动
        if (img_width > _contentWidth) {
          // 左边界
          const _l = (img_width - _contentWidth) / 2 + _currentImgs[_currentCount].orgImageX;
          // 右边界
          const _r = (img_width - _contentWidth) / 2 - _currentImgs[_currentCount].orgImageX;
          if (translateX >= _l) {
            // console.log("translateX >= _l", _l);
            _currentImgs[_currentCount].imageX = _l;
            if(translateX >= _l + 20) {
              _currentImgs[_currentCount].isEdeg = true;
            }
            operateType = "move";
          } else if (_r + translateX <= 0) {
            // console.log("_r + translateX <= 0", _r);
            _currentImgs[_currentCount].imageX = -_r;
            if(_r + translateX <= 20) {
              _currentImgs[_currentCount].isEdeg = true;
            }
            operateType = "move";
          } else {
            _currentImgs[_currentCount].imageX = translateX;
            // console.log('translateX', translateX);
          }
          // console.log('_currentImgs[_currentCount].imageX', _currentImgs[_currentCount].imageX);
        }

        // 图片高度大于画布高度才可上下拖动
        if (img_height > _contentHeight) {
          // 顶部边界
          const _t = (img_height - _contentHeight) / 2 + _currentImgs[_currentCount].orgImageY;
          const _b = (img_height - _contentHeight) / 2 - _currentImgs[_currentCount].orgImageY;
          if (translateY >= _t) {
            _currentImgs[_currentCount].imageY = _t;
          } else if (_b + translateY <= 0) {
            _currentImgs[_currentCount].imageY = -_b;
          } else {
            _currentImgs[_currentCount].imageY = translateY;
            // console.log('translateY', translateY);
          }
        }
        this.setData({
          _currentImgs,
        });
        // console.log(_currentImgs[0]);
      }

    },
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

    // 关闭图片预览
    hideGallery() {
      this.setData({
        show: false,
        _currentCount: 0,
        _imageScale: 1,
      });
    },

    /** 左右箭头 */
    onTapArrowLeft() {
      const { _currentCount } = this.data;
      this.setData({
        _currentCount: _currentCount > 0 ? _currentCount - 1 : 0,
        _imageScale: 1,
      });
    },

    onTapArrowRight() {
      const { _currentCount, _currentImgs } = this.data;
      const len = _currentImgs.length;
      const count = _currentCount + 1;
      this.setData({
        _currentCount: count >= len ? len - 1 : count,
        _imageScale: 1,
      });
    },
    /** 左右箭头 */
  },
});
