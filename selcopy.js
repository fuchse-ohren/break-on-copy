var current_url = ""

function testSameOrigin(url) {
  var loc = window.location,
    a = document.createElement('a');
    a.href = url;
    return a.hostname == loc.hostname &&
           a.port == loc.port &&
           a.protocol == loc.protocol;
}

function copyselected(ele){
  var cptxt = ele.getSelection().toString()
  cptxt = cptxt.replace(/(\r\n){2,}|\r{2,}|\n{2,}/, '\n');

  if(cptxt != ""){
    navigator.clipboard.writeText(cptxt);
    ele.getSelection().removeAllRanges();;

    var n = new Notification(
    "クリップボードにコピーしました",
      {
        body: cptxt.substr(0,150),
        icon: browser.runtime.getURL('icons/icon.png'),
      }
    );
    console.log("[selcopy.js] クリップボードに選択したテキストがコピーされました");
  }
}

function init_listener(){
  if(location.href != current_url){
  	current_url = location.href;
  	console.log("[selcopy.js] URLの変更を検知したため新たにイベントリスナの追加を試みます")
    try{
      var iframes = document.getElementsByTagName("iframe");
      for(var i = 0 ; i<iframes.length ; i++){
        if(testSameOrigin(iframes[i].contentDocument.location.href)){
          iframes[i].contentDocument.addEventListener("mouseup",()=>{copyselected(iframes[0].contentWindow)})
          console.log("[selcopy.js] イベントリスナを追加しました")
        }else{
          console.log("[selcopy.js] "+firames[i].contentDocument.lication.href+"は同一生成元でないためイベントリスナを追加できませんでした")
        }
      }
      
    }catch{
        console.log("[selcopy.js] イベントリスナ追加の際にエラーが発生しました")
    }
  }
}

document.addEventListener("mouseup",()=>{copyselected(window)});
setInterval(init_listener, 2000)
Notification.requestPermission()