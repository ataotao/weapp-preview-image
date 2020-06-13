// components/previewImage/previewImage.js
// components/gallery-custom/gallery-custom.js
const app = getApp();
import { throttle, AutoSize, getSystemInfo } from './utils';
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
        // const sysInfo = getSystemInfo();
        // const { contentWidth, contentHeight, customBar } = sysInfo;
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
      }
    },
    show: {
      type: Boolean,
      value: false,
      observer(newVal) {
        this.setData({ _currentShow: newVal });
      }
    },
    current: {
      type: Number,
      value: 0,
      observer(newVal) {
        this.setData({ _currentCount: newVal });
      }
    }
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
    _imageScale: 1
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
      console.log('attached', this.data);
      const sysInfo = getSystemInfo();
      const { contentWidth, contentHeight } = sysInfo;
      this.setData({ _contentWidth: contentWidth, _contentHeight: contentHeight });
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
      
        // const { currentImgs } = this.data;

        let _currentImgs = [...currentImgs];
        const index = currentCount;
        if (_currentImgs.length > 0 && !_currentImgs[index].width) {
          const src = _currentImgs[index] ? _currentImgs[index].src : '';
          const title = _currentImgs[index].title;
          this.setData({ _isLoading: true });
          for (let i = 0; i < _currentImgs.length; i++) {
            const el = _currentImgs[i];
             _currentImgs[i] = await this.initImgData(el);
          }

          this.setData({
            _currentImgs
          }, () => {
            console.log(_currentImgs);
            this.setData({ _isLoading: false });
          });
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
              orgImageY: (contentHeight - img.height) / 2
            });
          },
          fail: (err) => {
            console.log(err);
            reject(err);
          },
        });
      });
    }
  }
})
