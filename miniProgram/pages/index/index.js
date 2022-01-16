// 定义城市、天气、温度、风级、图片,日期参数
var defaultcity, getTodayweather, gettip, getweather1, getweather2, getweather3
var localCity
var bmap = require('../../utils/bmap-wx.min.js'); //引入js模块
var BMap    //定义百度位置服务参数
  
// 调用百度天气接口获取天气数据
var ak = 'y0DACdQU8AHI5bTDN3NStcwBE4GHZ2G2' 


Page({
  data: {},
  onLoad: function (e) {
    //将本地缓存中名为localCity的值取出来，赋值给localCity
    localCity = wx.getStorageSync('localCity')
    if (localCity) {
      defaultcity = localCity
      this.weather()
    } else {
      defaultcity = '广州'   // 默认城市名称
      this.weather()
    }
    BMap = new bmap.BMapWX({   //新建百度地图对象
      ak:ak
    });

  },


  // 动态获取input输入值 城市名称
  bindKeyInput: function (e) {
    defaultcity = e.detail.value
  },


  // 搜索城市
  search: function (e) {
    this.weather()
  },
  weather: function () {
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: 'https://api.map.baidu.com/telematics/v3/weather?output=json&ak=' + ak + '&location=' + defaultcity,
      success: res => {
        console.log(res.data)
        if (!res.data.results) {
          wx.showToast({
            title: '输入无法确定的地理位置信息或发生未知错误',
            icon: "none",
            duration: 2500
          })
          console.log('获取天气接口失败')
          return
        }

        //获取当前天气
        getTodayweather = res.data.results[0].weather_data[0]
        gettip = res.data.results[0].index[0].des   //获取提示信息

        //未来三日天气
        getweather1 = res.data.results[0].weather_data[1]
        getweather2 = res.data.results[0].weather_data[2]
        getweather3 = res.data.results[0].weather_data[3]
        this.setData({
          city: defaultcity,
          today: getTodayweather,
          tip: gettip,
          tomorrow1: getweather1,
          tomorrow2: getweather2,
          tomorrow3: getweather3,
        })
        wx.hideLoading()
      }
    })
  },

  //获取当前位置
  getMyLocation: function () {
    this.getUserLocation();
  },

  //请求位置授权 
  getUserLocation: function () {
    let that = this;
    wx.getSetting({
      success: (res) => {
        console.log(JSON.stringify(res))
        // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
        // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
        // res.authSetting['scope.userLocation'] == true    表示 地理位置授权
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: function (res) {
              if (res.cancel) {
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 1000
                })
              } else if (res.confirm) {
                wx.openSetting({
                  success: function (dataAu) {
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                      //再次授权，调用wx.getLocation的API
                      that.getLocation();
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {
          //调用wx.getLocation的API
          that.getLocation();
        }
        else {    //res.authSetting['scope.userLocation'] == true
          //调用wx.getLocation的API
          that.getLocation();
        }
      }
    })
  },


  //百度地图逆地址解析服务
  getLocation: function () {
    var that = this
    BMap.regeocoding({
      success(res) {
        //var location = res.originalData.result.addressComponent.city      //获取市
        var location = res.originalData.result.addressComponent.district   //获取区
        defaultcity = location   //将获取的位置更换默认城市的值
        wx.setStorage({   //将获取的数据进行缓存，命名为localCity，值为location的值
          key: 'localCity',
          data: location,
        })
        console.log("当前地理位置信息", defaultcity)
        that.weather();  //调用天气函数
      },
      fail(res) {
        console.log("调用位置信息失败", res)
      }
    });
  },


})
