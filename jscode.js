//window.onload = settime();




var arrivedStations = [];
var speedG;

var maybeLoc = [];
var maybeDist = [];
var gpsLoc_LH=[];

var nowDate_begin;
var nowDate_end;

var count=0;
function MORorEVE(time){
  //console.log(nowtime)
  //莲花线各站点坐标
  let gpsLocMor_LH = [
    {name:"莲花影剧院",lng:118.12903,lat:24.48517},
    {name:"莲花宿舍",lng:118.13307,lat:24.48820},
    {name:"金鹭金店",lng:118.123567,lat:24.482753,},
    {name:"长青路",lng:118.12255,lat:24.48911},
    {name:"育秀中路春雨花行门口",lng:118.111227,lat:24.487233},
    {name:"海沧",lng:117.99133,lat:24.52721}
  ]
  let gpsLocEve_LH = [
    {name:"莲花影剧院",lng:118.12903,lat:24.48517},
    {name:"莲花宿舍",lng:118.13307,lat:24.4882},
    {name:"金鹭金店",lng:118.12344,lat:24.48272},
    {name:"长青路",lng:118.12255,lat:24.48911},
    {name:"体育东村路口",lng:118.112724,lat:24.485525},
    {name:"东岳路",lng:118.10484,lat:24.48887},
    {name:"岳阳",lng:118.09556,lat:24.489922},
    {name:"海沧",lng:117.99133,lat:24.52721}
  ]
  if(time<=8){

      gpsLoc_LH=gpsLocMor_LH
      return(1)

  }else if(time>=15&&time<=16){

      gpsLoc_LH=gpsLocEve_LH
      return(1)

  }else{
    document.getElementById("carArrival").textContent = "车辆未运行";
    return(0)
  }


}



 
document.addEventListener("DOMContentLoaded", function () {
  // 监视器，DOM加载完后执行
  let code;
  initializeStationBoards();


  function updateTime() {
      let a =count++;


      let now = new Date();
      // 获取当前时间，并格式化为指定的字符串形式

      let timeString = now.toLocaleTimeString(); // 或者使用 now.toISOString().slice(11, 19) 来获取24小时制的时间

      let timestamp = now.getTime();
      let endTime=timestamp;
      let beginTime=endTime;


      nowDate_begin= timestampToTime(beginTime);//开始时间
      nowDate_end= timestampToTime(endTime);//结束时间

      let ceshi = new Date(timestamp-1000*60*60*8).getHours().toString().padStart(2, '0');

      let nowtime = now.getHours().toString().padStart(2, '0');

      //console.log(ceshi)

      code=MORorEVE(nowtime)

      // 获取用于显示时间的元素，并更新其内容
      let timeDisplayElement = document.getElementById("timeDisplay");
      timeDisplayElement.textContent = nowDate_end;

      if(code==1&&a%45==0){

        getapi(nowDate_begin,nowDate_end)
      }
    
 
  }
  


  // 初始时显示一次时间
  updateTime();



  initializeStationBoards();
  updateStationStatuses(arrivedStations);
  

  setInterval(updateTime, 1000);

});


//api调用
function getapi(begin,end) {

 
  
  // var nowDate_begin= timestampToTime(beginTime);//开始时间
  // var nowDate_end= timestampToTime(endTime);//结束时间


  const apiUrl = 'http://112.5.172.48:12056/api/v1/basic/gps/detail';
  const data = {
      terid:'00BA04BF7D',//本条线车辆设备id
      key:'zT908g2j9ngkYQ4ygJF8smGGL8eh4G%2FO6ielcj1t1m1kLxVm4GRQ9g%3D%3D',
      //starttime:'2024-05-27 07:10:00',
      //endtime:'2024-05-27 07:44:00'

      starttime:begin,
      endtime:end
  };


  const options = {
  method: 'POST',
  headers: {
      'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
  };

  // 发送POST请求
  fetch(apiUrl, options)
  .then(response => {
    if (!response.ok) {
      throw new Error('HTTP error! status: ${response.status}');
    }
    return response.json();
  })

  .then(result => {

      if(result.errorcode==200){
      let dataArray = result.data//API获取的GPS数据
      //console.log(dataArray)

      let speedGather = [];
      for(let i=0;i<dataArray.length;i++){
          speedGather[i]=dataArray[i].speed
      }
      let arrayLength = dataArray.length
  
      let lastdata = dataArray[arrayLength-1]//最后一条GPS数据

      //console.log(lastdata)

      let lastLng_lat = [lastdata.gpslng,lastdata.gpslat]//纬度和经度
      speedG = speedGather
      //console.log(speedG)
   
      charge(lastLng_lat)//区间判断

      }else{
        alert('请联系管理员'+result.errorcode+result.errormsg)
      }
      
  });

  
}



//循环判断车辆处于哪个站点区间
 function charge(lastLng_lat){
  let dx;
  let dy;
  let dx1;
  let dy1;
  let dx2;
  let dy2;
  let i = 1
  let cosTheta1;
  let cosTheta2;


  do{
      //获取三个向量
      dx = gpsLoc_LH[i].lng-gpsLoc_LH[i-1].lng;//区间起点指向终点横坐标
      dy = gpsLoc_LH[i].lat-gpsLoc_LH[i-1].lat;
      dx1 = lastLng_lat[0] - gpsLoc_LH[i-1].lng;//区间起点指向车辆的横坐标
      dy1 = lastLng_lat[1] - gpsLoc_LH[i-1].lat;
      dx2 = gpsLoc_LH[i].lng - lastLng_lat[0];//车辆指向区间终点的横坐标
      dy2 = gpsLoc_LH[i].lat - lastLng_lat[1];

      //console.log(gpsLoc_LH[i].lng,gpsLoc_LH[i-1].lng,dx)

      
      //判断两组夹角
      cosTheta1 = (dx1 * dx + dy1 * dy) / (Math.sqrt(dx1 * dx1 + dy1 * dy1) * Math.sqrt(dx * dx + dy * dy));
      cosTheta2 = (dx2 * dx + dy2 * dy) / (Math.sqrt(dx2 * dx2 + dy2 * dy2) * Math.sqrt(dx * dx + dy * dy));
      console.log(i,cosTheta1,cosTheta2,gpsLoc_LH[i-1].name,gpsLoc_LH[i].name);

      let mayLoc = {name:gpsLoc_LH[i-1].name,lng:gpsLoc_LH[i-1].lng,lat:gpsLoc_LH[i-1].lat,No:i-1}

      if(cosTheta1>=0&&cosTheta2<=0){
        maybeLoc.push(mayLoc)//推送起点的[地名，纬度，经度]
        
      }
      i++;
    }while(i < gpsLoc_LH.length);

    //console.log(maybeLoc)

    if(maybeLoc.length==0){
      maybeLoc[0]={name:gpsLoc_LH[0].name,lng:gpsLoc_LH[0].lng,lat:gpsLoc_LH[0].lat,No:0}
    }


    for(let i=0;i<maybeLoc.length;i++){

      arriveCheck(maybeLoc[i],lastLng_lat);//{[起点的纬度,经度,站点],[车辆纬度,经度]}

    }

 
    pusharrive(lastLng_lat);

}


//车辆距离推出([起点的纬度,经度,站点]，[车辆纬度,经度])
function arriveCheck(GPSLoc,lng_lat) {

  let distance = computeDestance(GPSLoc,lng_lat);
  let data = {dist:distance,name:GPSLoc.name,No:GPSLoc.No} //车辆与区间起点距离，站名

  maybeDist.push(data)

}

function pusharrive(arr) {

  //console.log(maybeDist)

  let Mini = maybeDist[0].dist
  let Mininame = maybeDist[0].name
  let k;


  for(let i=0;i<maybeDist.length;i++){
    if (maybeDist[i].dist<= Mini) {
      Mini = maybeDist[i].dist;
      Mininame = maybeDist[i].name; 
      k = maybeDist[i].No
    }
  }


  for(let i=0;i<=k;i++){
     
    arrivedStations[i]=gpsLoc_LH[i].name;
    //console.log(arrivedStations)
    
  }
  let lng_lat_now = gpsLoc_LH[k]
  let lng_lat_next = gpsLoc_LH[k+1]

  gdDistance(arr,lng_lat_next,lng_lat_now)



  //console.log(arrivedStations,lng_lat,array)

  updateStationStatuses(arrivedStations);


  return maybeDist[k]

}
    



function gdDistance(carnow,locnext,locnow){
  // let b = count%5;
  // console.log('b:'+b)


  let Loc = [locnext.lng,locnext.lat]
  let name  = locnow.name;
  let CarStr = carnow.map(String).join(',');
  let LocStr = Loc.map(String).join(',');
  let keyStr = '19611e7be8b678cd45bcbaa887867a95';

  const apiUrl = 'https://restapi.amap.com/v3/distance';
  const params = {
    key: keyStr,
    origins: CarStr,
    destination:LocStr,
    type:1
  };


    callApiWithParams(apiUrl, params,name);


}


function callApiWithParams(url, params,name) {
  let result;
  let distance;
  let queryString = '';
  for (let key in params) {
      if (queryString) {
          queryString += '&';
      }
      queryString += encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }
  const fullUrl = url + '?' + queryString;
  
/*  // 使用fetch或其他HTTP客户端发送GET请求
  fetch(fullUrl)
      .then(response => response.json())
      .catch(error => {
        //console.error('Error:', error);
    })
      .then(data => {

          result = data.results;
          distance = result[0].distance;
          console.log(distance);
          reNeedTime(name,distance)
      })
      */
      reNeedTime(name)
}



function calculateAverage(array) {

  const nonZeroValues = array.filter(value => value !== 0);

  if (nonZeroValues.length === 0) {
      return 0;
  }
  
  // 使用reduce方法计算数组的总和
  const sum = array.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  

  const average = sum / array.length;
  
  return average;
}


function reNeedTime(locationName,distance){
  let speed = calculateAverage(speedG);
  let reNeedTime = Math.ceil(((distance/1000)/speed)*60)
  //console.log(distance,speed,reNeedTime,locationName)

  if(speed==0){
    document.getElementById("carArrival").innerHTML = '当前到站：'+locationName//+'，到达下一站约：1分钟以内'
  }else{
    document.getElementById("carArrival").innerHTML = '当前到站：'+locationName//+'，到达下一站约：'+reNeedTime+'分钟'
  }

}





function initializeStationBoards(){

  let stations=[];

  for(let i=0;i<gpsLoc_LH.length;i++){
      stations[i]=gpsLoc_LH[i].name;
  }

  // 获取站名牌容器
  let stationBoard = document.getElementById('stationBoard');


  // 遍历站点数组，动态创建站名牌
  stations.forEach(station => {
    let stationElement = document.createElement('div');
    stationElement.classList.add('station');
    stationElement.textContent = station;
    stationElement.dataset.station = station; // 将站点名称存储在data属性中
    stationBoard.appendChild(stationElement);
    });
}

//更新站牌状态
function updateStationStatuses(arrivedStations) {
  const stationElements = document.querySelectorAll('.station');
  //console.log(stationElements)
  stationElements.forEach(stationElement => {
      const stationName = stationElement.dataset.station;
      if (arrivedStations.includes(stationName)) {
          stationElement.classList.add('arrived');
      } else {
          stationElement.classList.remove('arrived');
      }
  });
  //console.log(arrivedStations)
}






//计算两点间距离，米
function computeDestance(startCoords,desCoords){
  let GPSLoc =startCoords;//[起点的纬度,经度,站点]
  let lng_lat = desCoords;//[车辆纬度,经度]

 
 
  let startLatRads = degreeToRadians(GPSLoc.lng);
  let startLongRads = degreeToRadians(GPSLoc.lat);
  let destLatRads = degreeToRadians(lng_lat[0]);
  let destLongRads = degreeToRadians(lng_lat[1]);


  let radiusEarth = 6371*1000;
  let distance = Math.acos(Math.sin(startLatRads) * Math.sin(destLatRads) + Math.cos(startLatRads) * Math.cos(destLatRads) * Math.cos(destLongRads - startLongRads)) * radiusEarth;

  return distance;
}

function degreeToRadians(degrees){
  let radians = (degrees * Math.PI)/180;
  return radians;
}



// 将时间戳转换为Date对象
function timestampToTime(timestamp) {

  var date = new Date(timestamp);  

  // 获取年、月、日、小时、分钟和秒
  var year = date.getFullYear();
  var month = (date.getMonth() + 1).toString().padStart(2, '0');
  var day = date.getDate().toString().padStart(2, '0');
  var hours = date.getHours().toString().padStart(2, '0');
  var minutes = date.getMinutes().toString().padStart(2, '0');
  var seconds = date.getSeconds().toString().padStart(2, '0');
  
  // 返回格式化的时间字符串
  return year +'-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
}



