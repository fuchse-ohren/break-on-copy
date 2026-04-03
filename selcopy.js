var mousePos = {
  x: 0,
  y: 0,
};
var tipTimer = null;

function seikeiText(text) {
  return text.replace(/(\r\n){2,}|\r{2,}|\n{2,}/g, "\n").trim();
}

function showCopyTip(winObj, text) {
  var docObj = winObj.document;
  if (!docObj || !docObj.body) {
    return;
  }

  var oldTip = docObj.getElementById("selcopy-mouse-tip");
  if (oldTip && oldTip.parentNode) {
    oldTip.parentNode.removeChild(oldTip);
  }

  var tip = docObj.createElement("div");
  tip.id = "selcopy-mouse-tip";
  tip.textContent =
    "コピーしました!\n『" +
    (text.length > 80 ? text.slice(0, 80) + "..." : text) +
    "』";
  tip.style.position = "fixed";
  tip.style.left = mousePos.x + 14 + "px";
  tip.style.top = mousePos.y + 14 + "px";
  tip.style.maxWidth = "360px";
  tip.style.padding = "8px 10px";
  tip.style.background = "rgba(20, 20, 20, 0.92)";
  tip.style.color = "#fff";
  tip.style.borderRadius = "8px";
  tip.style.fontSize = "12px";
  tip.style.lineHeight = "1.4";
  tip.style.zIndex = "2147483647";
  tip.style.pointerEvents = "none";
  tip.style.whiteSpace = "pre-wrap";
  tip.style.wordBreak = "break-word";
  tip.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.25)";

  docObj.body.appendChild(tip);

  if (tipTimer) {
    clearTimeout(tipTimer);
  }

  tipTimer = setTimeout(function () {
    if (tip.parentNode) {
      tip.parentNode.removeChild(tip);
    }
  }, 1600);
}

function copySelected(winObj) {
  var selected = winObj.getSelection().toString();
  var copyText = seikeiText(selected);

  if (copyText === "") {
    return;
  }

  navigator.clipboard.writeText(copyText);
  winObj.getSelection().removeAllRanges();
  showCopyTip(winObj, copyText);
  console.log("[Break on Copy] コマンドで選択テキストをコピーしました");
}

function onMouseMove(e) {
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;
}

function setup() {
  document.addEventListener("mousemove", onMouseMove, { passive: true });

  browser.runtime.onMessage.addListener(function (msg) {
    if (!msg || msg.action !== "run_copy") {
      return;
    }
    copySelected(window);
  });
}

setup();
