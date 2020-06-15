/**
 * @return {
 *  contentWidth: number;
 *  contentHeight: number;
 *  customBar: number;
 * 
 * }
 */
export const  getSystemInfo = () => {
    // 获取画布属性
    const sysInfo = wx.getSystemInfoSync();
    let capsule = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
    const customBar = capsule.bottom + capsule.top - (sysInfo.statusBarHeight || 0);
    return {
      contentWidth: sysInfo.windowWidth,
      contentHeight: sysInfo.windowHeight,
      customBar,
      ...sysInfo
    }
}


/*函数防抖*/
export function debounce(fn, interval) {
  var timer;
  var gapTime = interval || 1000;//间隔时间，如果interval不传，则默认1000ms
  return function() {
    clearTimeout(timer);
    var context = this;
    var args = arguments;//保存此处的arguments，因为setTimeout是全局的，arguments不是防抖函数需要的。
    timer = setTimeout(function() {
      fn.call(context,...args);
    }, gapTime);
  };
}

/****** 图片在图片框内按宽高比例自动缩放 ***/
export function AutoSize(image, maxWidth, maxHeight) {
  let img = {};
  // 当图片比图片框小时不做任何改变
  if (image.width < maxWidth && image.height < maxHeight) {
    img.width = image.width;
    img.height = image.height;
  } else {
    /*
    //原图片宽高比例 大于 图片框宽高比例,则以框的宽为标准缩放，反之以框的高为标准缩放
    if (maxWidth / maxHeight <= image.width / image.height) {
      //原图片宽高比例 大于 图片框宽高比例
      img.width = maxWidth; //以框的宽度为标准
      img.height = maxWidth * (image.height / image.width);
    } else {
      //原图片宽高比例 小于 图片框宽高比例
      img.width = maxHeight * (image.width / image.height);
      img.height = maxHeight; //以框的高度为标准
    }
    */
   img.width = maxWidth; //以框的宽度为标准
   img.height = maxWidth * (image.height / image.width);
  }
  return img;
}

/*函数节流*/
export function throttle(fn, interval) {
  var enterTime = 0;//触发的时间
  var gapTime = interval || 300 ;//间隔时间，如果interval不传，则默认300ms
  return function() {
    var context = this;
    var backTime = new Date();//第一次函数return即触发的时间
    if (backTime - enterTime > gapTime) {
      fn.call(context, ...arguments);
      enterTime = backTime;//赋值给第一次触发的时间，这样就保存了第二次触发的时间
    }
  };
}
