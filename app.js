var teams = []
for (let i = 0; i < 5; i++) {
  var cars = []
  for (let j = 0; j < 30; j++) {
    var x = getRandom(1138591, 1141718) / 10000
    var y = getRandom(224851, 227159) / 10000
    var obj = {
      code: `编号：${Math.round(Math.random() * 100000000)}`,
      user: '张xx',
      tel: '139696536341',
      location: [x, y]
    }
    cars.push(obj)
  }
  teams.push({
    code: `车队${i + 1}`,
    user: '王队',
    tel: '36322',
    children: cars
  })
}

var tableData = [
  {
    prop: '编号',
    value: '6536113'
  },
  {
    prop: '车牌号',
    value: '粤B 36A113'
  },
  {
    prop: '司机',
    value: '张三'
  },
  {
    prop: '状态',
    value: '在线'
  },
  
]

new Vue({
  el: '#app',
  data () {
    return {
      map: null,
      popup: null,
      vectorLayer: null,
      overlay: null,
      defaultProps: {
        children: 'children',
        label: 'code'
      },
      input: '',
      cars: teams,
      tableData: tableData,
      showInfo: false,
      selectedFt: null
    }
  },
  mounted() {
    this.initMap()
  },
  methods: {
    initMap() {
      url = 'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}'
      var baseLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: url
        })
      })
    
      this.popup = document.getElementById('popup');
      this.overlay = new ol.Overlay({
          element: this.popup,
          offset: [10,10],
          autoPan: true,
          autoPanAnimation: {
          duration: 250
          }
      });

      this.vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector(),
        style (ft) {
          return new ol.style.Style({
            image: new ol.style.Icon({
              src: './public/image/location.png',
              scale: 1,
            })
          })
        }
      })
    
      this.map = new ol.Map({
          target: 'map',
          view: new ol.View({
              projection: 'EPSG:4326',
              center: [114.035617,22.567548],
              zoom: 11,
          }),
          overlays:[this.overlay],
          layers: [baseLayer, this.vectorLayer]
      });

      this.map.on('click', () => {
        this.showInfo = !this.showInfo
      })
    },
    showCarsInMap (cars) {
      if (Array.isArray(cars)) {
        var data = cars.map((car) => {
          ft = new ol.Feature({
            geometry: new ol.geom.Point(car.location)
          })
          // car.visibel = true
          ft.setProperties(car)
          return ft
        })
        if(this.map) {
          this.vectorLayer.getSource().addFeatures(data)
        }
      }
    },
    checkChangeHandle (data, checked, indeterminate) {
      console.log(data, checked, indeterminate);
      var cars = []
      if (data.children) {
        cars = data.children
      } else if (data.location) {
        cars = [data]
      }
      if (!checked) {
        this.clearCars(cars)
      } else {
        this.showCarsInMap(cars)
      }
    },
    nodeClickHandle (data) {
      console.log(data)
      if (this.selectedFt) {
        this.selectedFt.setStyle(null)
      }
      if (data.location) {
        this.map.getView().setCenter(data.location)
        const fts = this.vectorLayer.getSource().getFeatures()
        for(let ft of fts) {
          if(ft.get('code') === data.code) {
            const style = new ol.style.Style({
              image: new ol.style.Icon({
                src: './public/image/location-s.png',
                scale: 1,
              })
            })
            ft.setStyle(style)
            this.selectedFt = ft
          }
        }
      }
    },
    clearCars (cars) {
      var source = this.vectorLayer.getSource()
      var features = source.getFeatures()
      
      var codes = cars.map((car) => {
        return car.code
      })
      features.forEach((ft) => {
        if (codes.includes(ft.get('code'))) {
          source.removeFeature(ft)
        }
      })
      // cars.forEach((car) => [
      //   car.visibel = false
      // ])
    },
    showTrack () {
      
    }
  }
})


function getRandom (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}