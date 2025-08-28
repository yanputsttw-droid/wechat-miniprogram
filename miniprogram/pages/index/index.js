// index.js
Page({
  data: {
    userInfo: null,
    scanResult: '',
    orderInfo: null,
    processing: false,
    success: false,
    error: ''
  },

  onLoad() {
    this.checkLoginStatus()
  },







  // 检查登录状态
  checkLoginStatus() {
    const app = getApp()
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    } else {
      // 未登录，跳转到登录页
      wx.redirectTo({
        url: '/pages/login/login'
      })
    }
  },

  // 扫码功能
  scanQRCode() {
    const app = getApp();
    
    // 直接执行扫码
    this.performScan();
  },
  

  
  // 执行扫码操作
  performScan() {
    const that = this
    const app = getApp()
    
    // 直接使用微信小程序官方API检查摄像头权限
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.camera']) {
          // 未授权摄像头权限，请求授权
          wx.authorize({
            scope: 'scope.camera',
            success: () => {
              // 授权成功，执行扫码
              that.doScan();
            },
            fail: () => {
              // 授权失败，提示用户
              wx.showModal({
                title: '提示',
                content: '请授权使用摄像头功能，否则无法使用扫码功能',
                showCancel: false
              });
            }
          });
        } else {
          // 已授权摄像头权限，直接执行扫码
          that.doScan();
        }
      },
      fail: (err) => {
        console.error('获取设置失败:', err);
        wx.showToast({
          title: '获取设置失败',
          icon: 'none'
        });
      }
    });
  },
  
  // 执行扫码
  doScan() {
    const that = this;
    
    wx.scanCode({
      success(res) {
        const result = res.result;
        that.setData({
          scanResult: result,
          processing: true,
          success: false,
          error: ''
        });