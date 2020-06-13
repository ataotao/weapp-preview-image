// components/gallery-custom/gallery-custom.js
const app = getApp();
import { throttle, AutoSize } from '../../utils/tools';
let touchStartX = 0;//触摸时的原点  
let touchStartY = 0;//触摸时的原点  
let time = 0;// 时间记录，用于滑动时且时间小于1s则执行左右滑动  
let interval = '';// 记录/清理时间记录  
let touchMoveX = 0; // x轴方向移动的距离
let touchMoveY = 0; // y轴方向移动的距离

Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    imgUrls: {
      type: Array,
      value: [],
      observer(newVal = [], oldVal, changedPath) {
        // console.log(newVal);
        const { contentWidth, contentHeight, CustomBar } =  this.data;
        this.setData({ 
          currentImgs: newVal.map(v => {
            return {
              ...v,
              imageX: (contentWidth) / 2,
              imageY: (contentHeight + CustomBar) / 2,
              orgImageX: (contentWidth ) / 2,
              orgImageY: (contentHeight + CustomBar) / 2
            }
          })
        });
      }
    },
    show: {
      type: Boolean,
      value: false,
      observer(newVal, oldVal, changedPath) {
        // console.log(newVal);
        this.setData({ currentShow: newVal });
        // console.log('show newVal', newVal);
      }
    },
    current: {
      type: Number,
      value: 1,
      observer(newVal, oldVal, changedPath) {
        this.setData({ currentCount: newVal });
      }
    }
  },

  lifetimes: {
    attached() {
      // 在组件实例进入页面节点树时执行
      // console.log('attached');
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
      // console.log('detached');
    },
  },

  data: {
    currentImgs: [],
    currentCount: 1, // 当前索引
    isLoading: false,
    _lastTapTime: 0,
    /**手势处理 */
    _endMove: false, // 是否结束移动
    contentWidth: 0, // 画布宽度
    contentHeight: 0, // 画布高度
    _hypotenuseLength: 0, // 双指触摸时斜边长度
    _operateType: null, // 移动/拖动类型 move | zoom
    _minScale: 1, // 最小缩放值
    _maxScale: 3, // 最大缩放值
    imageScale: 1 // 图片缩放比例
  },
  // 计算属性
  observers: {
    
    'show'(show) {
      // console.log('show', show);
      this.setData({ currentShow: show });
    },
    async 'currentImgs'(currentImgs) {
      if (currentImgs.length > 0 && !currentImgs.find(v => v.width)) {
        const { currentCount } = this.data;
        // console.log(currentImgs);
          // 获取图片信息
          this.getImgInfo(currentCount);
      }
    }
  },
  ready() {
    // 节流处理，提升性能
    this.throttleImageMove = throttle(this.onImageMove, 5);
    // 获取画布属性
    const sysInfo = wx.getSystemInfoSync();
    let capsule = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
    this.setData({
      contentWidth: sysInfo.windowWidth,
      contentHeight: sysInfo.windowHeight,
      CustomBar: capsule.bottom + capsule.top - sysInfo.statusBarHeight
    });
  },

  methods: {

    hideGallery() {
      // const { currentImgs } = this.data;
      this.setData({
        show: false,
        currentShow: false,
        imageScale: 1,
        currentCount: 1,
        currentImgs: []
      });
      // this.triggerEvent('hide', {}, {});
    },

    // 获取图片信息
    getImgInfo(currentCount) {
      return new Promise((resolve, reject) => {
        const { currentImgs, contentWidth, contentHeight, CustomBar } = this.data;
        console.log(currentImgs, contentWidth, contentHeight, CustomBar);
        
        let _currentImgs = [...currentImgs];
        const index = currentCount - 1;
        if(_currentImgs.length > 0 && !_currentImgs[index].width) {
          const src = _currentImgs[index] ? _currentImgs[index].src : '';
          const title = _currentImgs[index].title;
          this.setData({ isLoading: true });
          wx.getImageInfo({
            src,
            success: (imgRes) => {
              const img = AutoSize(imgRes, contentWidth, contentHeight);
              _currentImgs[index] = ({
                src,
                title,
                width: img.width,
                height: img.height,
                imageX: (contentWidth - img.width) / 2,
                imageY: (contentHeight - img.height + CustomBar) / 2,
                orgImageX: (contentWidth - img.width) / 2,
                orgImageY: (contentHeight - img.height + CustomBar) / 2
              });
              this.setData({ 
                currentImgs: _currentImgs
              }, () => {
                this.setData({ isLoading: false });
              });
              // console.log(_currentImgs);
              resolve();
            },
            fail: (err) => {
              console.log(err);
              reject(err);
            },
          });
        }else{
          resolve();
        }
        // console.log(_currentImgs);
      });
    },

    /** 手势处理 */
    onImageStart(e) {
      // console.log('onImageStart', e);

      if (e.touches.length > 1) {
        //双指放大
        const width = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
        const height = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
        this.data._hypotenuseLength = Math.sqrt(
          Math.pow(width, 2) + Math.pow(height, 2)
        );
        this.data._operateType = 'zoom';
      }else{
        touchStartX = e.touches[0].pageX; // 获取触摸时的原点  
        touchStartY = e.touches[0].pageY; // 获取触摸时的原点  
        // 使用js计时器记录时间    
        interval = setInterval(function () {
          time++;
        }, 100);
      }
    },
    onImageEnd(e) {
      const { currentCount, currentImgs, imgUrls, imageScale } = this.data;
      // console.log('onTouchEnd', e);
      let _currentImgs = [...currentImgs];
      const index = currentCount - 1;
      
      if(this.data._operateType !== 'zoom' && this.data._operateType !== 'move' && e.changedTouches.length === 1) {
        // 判断滑动方向
        let moveX = touchMoveX - touchStartX;
        let moveY = touchMoveY - touchStartY;
        if (Math.sign(moveX) == -1) {
          moveX = moveX * -1;
        }
        if (Math.sign(moveY) == -1) {
          moveY = moveY * -1;
        }
        if (moveX <= moveY) {// 上下
          _currentImgs[index].imageY = _currentImgs[index].orgImageY;
          // 向上滑动
          if (touchMoveY - touchStartY <= -30 && time < 10) {
            // console.log('向上滑动');
            if(imageScale === 1) {
              return this.hideGallery();
            }
            
          }
          // 向下滑动  
          if (touchMoveY - touchStartY >= 30 && time < 10) {
            // console.log('向下滑动 ');            
            if(imageScale === 1) {
              return this.hideGallery();
            }
          }
          this.setData({ 
            currentImgs: _currentImgs
          });
        }else {
          _currentImgs[index].imageX = _currentImgs[index].orgImageX;
          _currentImgs[index].imageY = _currentImgs[index].orgImageY;
          // 左右
          console.log('time onImageEnd', time);
          if(time < 10) {
            let _currentCount = currentCount;
            // 向左滑动
            if (touchMoveX - touchStartX <= -50) {
              // console.log('左滑页面');
              // if(imageScale > 1) {
              //   // this.setData({ imageScale: 1 });
              //   console.log('左滑页面', this.data._operateType);
              // }else{
                const current = currentCount + 1;
                const len = imgUrls.length;
                _currentCount = current > len ? len : current;
                this.setData({ 
                  currentCount: _currentCount,
                  currentImgs: _currentImgs,
                  imageScale: 1
                });
                // 获取图片信息
                this.getImgInfo(_currentCount);
              // }

            }
            // 向右滑动  
            if (touchMoveX - touchStartX >= 50) {
              // console.log('右滑页面');
              // if(imageScale > 1) {
              //   // this.setData({ imageScale: 1 });
              //   console.log('右滑页面', this.data._operateType);
              // }else{
                const current = currentCount - 1;
                _currentCount = current < 1 ? 1 : current;
                this.setData({ 
                  currentCount: _currentCount,
                  currentImgs: _currentImgs,
                  imageScale: 1
                });
                // 获取图片信息
                this.getImgInfo(_currentCount);
              // }
            }

          }else{
            // console.log('this.data._operateType', this.data._operateType);
            this.setData({ 
              currentImgs: _currentImgs 
            });
          }

        }
        clearInterval(interval); // 清除setInterval  
        time = 0;
      }

      this.data._operateType = null;
  
    },
    onImageMove(e) {
      // console.log('onImageMove', e);
      if (this.data._endMove) {
        return false;
      }
      const { imageScale, contentWidth, currentCount, currentImgs } = this.data;
      if (e.touches.length > 1) {
        if(this.data._operateType === 'zoom') {
          // 双指放大
          const { _minScale, _maxScale } = this.data;
          const width = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
          const height = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
          const hypotenuse = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
          let scale =
            this.data.imageScale * (hypotenuse / this.data._hypotenuseLength);
          scale = scale <= _minScale ? _minScale : scale;
          scale = scale >= _maxScale ? _maxScale : scale;
          this.setData({ imageScale: scale }, () => {
            this.data._hypotenuseLength = Math.sqrt(
              Math.pow(width, 2) + Math.pow(height, 2)
            );
          });
        }
      }else{

        // console.log('移动 this.data._operateType', this.data._operateType);
        // 移动
        touchMoveX = e.touches[0].pageX;
        touchMoveY = e.touches[0].pageY;

        let _currentImgs = [...currentImgs];
        const index = currentCount - 1;
        const curImg = _currentImgs[index];
        let moveX = (touchMoveX - touchStartX);
        let moveY = (touchMoveY - touchStartY);
        let imageX = moveX + curImg.imageX;
        let imageY = moveY + curImg.imageY;
        if(imageScale > 1) {
          this.data._operateType = 'move';
          // 当缩放比例大于1时，允许拖曳
          this.data._endMove = true;
          // 左右偏移
          const _x = (curImg.width * imageScale - contentWidth) / 2;
          if(imageX <= -_x - 200) {
            console.log('imageX <= -_x - 200', _x - 200, imageX);
            imageX = -_x - 200;
          }else if(imageX > _x + 200) {
            console.log('imageX > _x + 200', _x + 200, imageX);
            imageX = _x + 200;
          }

          if(imageX === curImg.imageX) {
            // 滑动到边缘切换图片
            this.data._operateType = null;
            time = 0;
            clearInterval(interval); // 清除setInterval  
          }

          if(moveY > 50) {
            // console.log('下');
            imageY = curImg.orgImageY + 100;
          }else if(moveY < -50) {
            // console.log('上');
            imageY = curImg.orgImageY - 100;
          }

          _currentImgs[index] = {
            ...curImg,
            imageX,
            imageY
          };

          // if(time === 0) {
          //   _currentImgs[index].imageX = curImg.orgImageX;
          //   _currentImgs[index].imageY = curImg.orgImageY;
          //   this.setData({ imageScale: 1 });
          // }
          this.setData({ currentImgs: _currentImgs }, () => {
            this.data._endMove = false;
          });
        }else{
          if(moveY > 50) {
            // console.log('下');
            imageY = curImg.orgImageY + 100;
          }else if(moveY < -50) {
            // console.log('上');
            imageY = curImg.orgImageY - 100;
          }
          _currentImgs[index] = {
            ...curImg,
            imageY
          };
          this.setData({ currentImgs: _currentImgs });

          this.data._operateType = null;
          time = 0;
          clearInterval(interval); // 清除setInterval  

        }
      }
    },
    doubleClick(e) {
      const { imageScale, _lastTapTime, currentImgs } = this.data;
      const curTime = e.timeStamp;
      const lastTime = _lastTapTime; 
      // console.log('this.data._endMove', this.data._endMove);
      // console.log('curTime - lastTime < 300', curTime - lastTime < 300, curTime - lastTime);
      if (curTime - lastTime > 0) {
        if (curTime - lastTime < 300) {
          // 双击事件 缩放图片
          this.setData({ 
            imageScale: imageScale === 1 ? 2 : 1,
            currentImgs: currentImgs.map(v => ({...v, imageX: v.orgImageX, imageY: v.orgImageY }))
          });
        }
        
      }
      this.data._lastTapTime = curTime;
    },
  },
});
