// app.js
App({
  onLaunch: function () {
    this.globalData = {
      // env 参数说明：
      //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个极环境的资源
      //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
      //   如不填则使用默认环境（第一个创建的环境）
      env: "cloudbase-5gwmm58bd5cec13f" // 云开发环境ID
    };
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }

    // 初始化全局事件通道
    this.initEventChannel();
  },







  // 初始化后台数据
  initBackgroundData() {
    // 检查是否支持后台数据获取
    if (wx.getBackgroundFetchData) {
      try {
        wx.getBackgroundFetchData({
          fetchType: 'periodic',
          success: (res) => {
            console.log('后台数据获取成功:', res);
            // 处理后台数据
            this.globalData.backgroundData = res;
          },
          fail: (err) => {
            // 忽略后台数据获取失败，不影响小程序正常使用
            console.warn('后台数据获取失败，但不影响小程序正常使用:', err);
            // 后台数据获取失败不影响小程序正常使用
            this.globalData.backgroundData = null;
          }
        });
      } catch (error) {
        // 捕获并忽略异常，不影响小程序正常使用