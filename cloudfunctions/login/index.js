// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  try {
    // 检查用户是否已存在
    const userQuery = await db.collection('users')
      .where({
        openid: wxContext.OPENID
      })
      .get()
    
    let userInfo = null
    
    if (userQuery.data.length > 0) {
      // 用户已存在，返回用户信息
      userInfo = userQuery.data[0]
    } else {
      // 新用户，创建用户记录
      const newUser = {
        openid: wxContext.OPENID,
        appid: wxContext.APPID,
        unionid: wxContext.UNIONID || '',
        username: wxContext.OPENID, // 使用openid作为username，避免唯一索引冲突
        name: '', // 初始姓名为空，需要用户设置
        role: 'delivery', // 默认角色为配送员
        avatarUrl: event.userInfo ? event.userInfo.avatarUrl : '',
        nickName: event.userInfo ? event.userInfo.nickName : '',
        gender: event.userInfo ? event.userInfo.gender : 0,
        country: event.userInfo ? event.userInfo.country : '',
        province: event.userInfo ? event.userInfo.province : '',
        city: event.userInfo ? event.userInfo.city : '',
        isFirstLogin: true,
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
      
      console.log('准备创建新用户:', newUser)
      
      // 插入新用户记录
      let insertResult
      try {
        insertResult = await db.collection('users').add({
          data: newUser
        })
        console.log('用户创建成功，ID:', insertResult._id)
      } catch (dbError) {
        console.error('插入用户记录失败:', dbError)
        // 数据库操作失败，返回错误信息
        return {
          success: false,
          error: dbError.message,
          message: '用户创建失败，请重试'
        }
      }
      
      userInfo = {
        ...newUser,
        _id: insertResult._id
      }
    }
    
    return {
      success: true,
      userInfo: {
        _id: userInfo._id,
        openid: userInfo.openid,
        name: userInfo.name,
        role: userInfo.role,
        avatarUrl: userInfo.avatarUrl,
        nickName: userInfo.nickName,
        isFirstLogin: userInfo.isFirstLogin,
        createTime: userInfo.createTime
      }
    }
    
  } catch (error) {
    console.error('登录云函数错误:', error)
    return {
      success: false,
      error: error.message
    }
  }
}