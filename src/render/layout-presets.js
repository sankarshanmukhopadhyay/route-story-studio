export const LAYOUT_PRESETS = {
  portrait: { id:'portrait', label:'Portrait Story', width:1080, height:1350, ratio:'4 / 5', routeBox:{x:90,y:140,width:900,height:550}, titleY:810, elevationY:940, statsY:1165 },
  square: { id:'square', label:'Square Route', width:1080, height:1080, ratio:'1 / 1', routeBox:{x:90,y:120,width:900,height:430}, titleY:660, elevationY:780, statsY:960 },
  landscape: { id:'landscape', label:'Landscape Summary', width:1600, height:900, ratio:'16 / 9', routeBox:{x:80,y:110,width:900,height:600}, titleY:190, elevationY:480, statsY:735 },
  editorial: { id:'editorial', label:'Editorial Photo', width:1080, height:1350, ratio:'4 / 5', routeBox:{x:90,y:145,width:900,height:600}, titleY:835, elevationY:965, statsY:1180 },
  expedition: { id:'expedition', label:'Expedition Log', width:1200, height:1500, ratio:'4 / 5', routeBox:{x:95,y:150,width:1010,height:610}, titleY:860, elevationY:1010, statsY:1300 },
  a4: { id:'a4', label:'A4 Print', width:2480, height:3508, ratio:'210 / 297', routeBox:{x:210,y:320,width:2060,height:1500}, titleY:2050, elevationY:2380, statsY:3060 },
  letter: { id:'letter', label:'Letter Print', width:2550, height:3300, ratio:'8.5 / 11', routeBox:{x:210,y:300,width:2130,height:1390}, titleY:1920, elevationY:2240, statsY:2860 }
};
