// pages/login/login.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    loginStatus: 'idle', // idle, loading, success, error
    loginError: null
  },

  onLoad() {
    const app = getApp();
    
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      });
    }
    
    // 先检查隐私协议状态，等待用户同意后再检查登录状态
    this.checkPrivacySetting();
  },
  


  // 检查本地存储的登录状态
  checkLocalLoginStatus() {
    const that = this
    
    // 先检查隐私协议状态
    if (wx.getPrivacySetting) {
      wx.getPrivacySetting({
        success: res => {
          console.log('隐私协议设置:', res)
          
          // 检查是否需要隐私授权
          if (res.needAuthorization) {
            // 需要隐私授权，显示提示并返回，不执行登录验证
            wx.showToast({
              title: '请先同意隐私协议',
              icon: 'none',
              duration: 2000
            })
            return
          }
          
          // 不需要隐私授权或已授权，继续检查本地登录状态
          that.checkLocalLoginStatusWithPrivacy()
        },
        fail: err => {
          console.error('获取隐私协议设置失败:', err)
          // 获取隐私协议设置失败，仍然检查本地登录状态
          that.checkLocalLoginStatusWithPrivacy()
        }
      })
    } else {
      // 不支持隐私协议接口，直接检查本地登录状态
      that.checkLocalLoginStatusWithPrivacy()
    }
  },
  
  // 已确认隐私协议后检查本地登录状态
  checkLocalLoginStatusWithPrivacy() {
    try {
      const openid = wx.getStorageSync('openid')
      const userInfo = wx.getStorageSync('userInfo')
      
      if (openid && userInfo && userInfo.openid) {
        console.log('检测到本地登录状态，openid:', openid)
        
        // 验证本地存储的用户信息在数据库中的有效性
        const that = this
        wx.cloud.callFunction({
          name: 'login',
          success: res => {
            console.log('验证本地登录状态结果:', res)
            
            // 检查返回结果结构
            if (!res.result) {
              console.error('云函数返回结果异常: 没有result字段', res)
              return
            }
            
            // 检查验证是否成功
            if (!res.result.success) {
              console.error('验证本地登录状态失败:', res.result.error || res.result.message || '未知错误')
              // 验证失败，提示需要重新登录
              wx.showToast({
                title: '登录状态已失效，请重新登录',
                icon: 'none',
                duration: 2000
              })
              return
            }
            
            // 检查返回的用户信息是否完整
            if (!res.result.userInfo || !res.result.userInfo._id) {
              console.error('数据库中用户信息不完整:', res.result.userInfo)