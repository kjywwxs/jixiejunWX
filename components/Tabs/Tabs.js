// components/Tabs/Tabs.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tabs:{
      type:Array,
      value:[]
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
     hanldeItemTap:function(e){
      const {index}=e.currentTarget.dataset;//获取索引
      this.triggerEvent("itemChange",{index})//触发父组件的自定义事件并传递参数
      
    //   const {index}=e.currentTarget.dataset;
    //   let {tabs}=this.data;
    //   tabs.forEach((v,i)=>i===index?v.isActive=true:v.isActive=false);
      
    //   this.setData({
    //     tabs
    //   })
   }
  }
})
