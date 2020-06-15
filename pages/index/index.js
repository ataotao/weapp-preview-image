//index.js
//获取应用实例
const app = getApp()

Page({
  data: {

    galleryShow: false,
    galleryImgs: [
      // { src: 'http://desk-fd.zol-img.com.cn/g5/M00/02/05/ChMkJ1bKyZmIWCwZABEwe5zfvyMAALIQABa1z4AETCT730.jpg', title: '1' },
      // { src: 'http://desk-fd.zol-img.com.cn/g5/M00/02/05/ChMkJ1bKyZmIWCwZABEwe5zfvyMAALIQABa1z4AETCT730.jpg', title: "2" },
      // { src: 'http://desk-fd.zol-img.com.cn/g5/M00/02/05/ChMkJ1bKyZmIWCwZABEwe5zfvyMAALIQABa1z4AETCT730.jpg', title: "3" }
    ],
    galleryCurrent: 0
  },
  onReady() {

    // var pswpElement = document.querySelectorAll('.pswp')[0];

    // // build items array
    // var items = [
    //   {
    //     src: 'https://placekitten.com/600/400',
    //     w: 600,
    //     h: 400
    //   },
    //   {
    //     src: 'https://placekitten.com/1200/900',
    //     w: 1200,
    //     h: 900
    //   }
    // ];

    // // define options (if needed)
    // var options = {
    //   // optionName: 'option value'
    //   // for example:
    //   index: 0 // start at first slide
    // };

    // // Initializes and opens PhotoSwipe
    // var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
    // gallery.init();
  },

  onTap() {
    this.setData({
      galleryShow: true,
      galleryImgs: [
        { src: 'https://article-fd.zol-img.com.cn/t_s375x666_w1/g3/M0A/0B/0F/ChMlV17h4JmIPlMEAAFsoFmuxowAAUpPQAKjkoAAWy4316.jpg', title: "2" },
        { src: 'https://desk-fd.zol-img.com.cn/g5/M00/02/05/ChMkJ1bKyZmIWCwZABEwe5zfvyMAALIQABa1z4AETCT730.jpg', title: '1' },
        { src: 'https://desk-fd.zol-img.com.cn/t_s960x600c5/g3/M07/0C/08/ChMlWF7jI-OIZXGUACXN6Zt4lq4AAUrhgNV3PUAJc4B223.jpg', title: "3" }
      ],
      galleryCurrent: 0
    })
  }

})
