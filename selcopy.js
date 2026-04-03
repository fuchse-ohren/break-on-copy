var currentUrl = "";
var keySettei = {
  shift: true,
  ctrl: false,
  alt: false,
  meta: false,
  key: "c",
};
var mousePos = {
  x: 0,
  y: 0,
};
var tipTimer = null;

function testSameOrigin(url) {
  var loc = window.location;
  var a = document.createElement("a");
  a.href = url;
  return (
    a.hostname === loc.hostname &&
    a.port === loc.port &&
    a.protocol === loc.protocol
  );
}

function seikeiText(text) {
  return text.replace(/(\r\n){2,}|\r{2,}|\n{2,}/g, "\n").trim();
}

function loadSettei() {
  if (!browser.storage || !browser.storage.local) {
    return Promise.resolve();
  }

  return browser.storage.local
    .get("copy_key_settei")
    .then(function (data) {
      if (data && data.copy_key_settei) {
        var saved = data.copy_key_settei;
        keySettei = {
          shift: !!saved.shift,
          ctrl: !!saved.ctrl,
          alt: !!saved.alt,
          meta: !!saved.meta,
          key: (saved.key || "c").toLowerCase(),
        };
      }
    })
    .catch(function () {
      console.log("[Break on Copy] 設定の読み込みに失敗しました");
    });
}

function isKeyMatch(e) {
  var pressKey = (e.key || "").toLowerCase();
  return (
    e.shiftKey === keySettei.shift &&
    e.ctrlKey === keySettei.ctrl &&
    e.altKey === keySettei.alt &&
    e.metaKey === keySettei.meta &&
    pressKey === keySettei.key
  );
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

  if (copyText !== "") {
    navigator.clipboard.writeText(copyText);
    winObj.getSelection().removeAllRanges();
    showCopyTip(winObj, copyText);
    console.log("[Break on Copy] ショートカットで選択テキストをコピーしました");
  }
}

function onKeyDown(e, winObj) {
  if (!isKeyMatch(e)) {
    return;
  }

  var tag = (
    e.target && e.target.tagName ? e.target.tagName : ""
  ).toLowerCase();
  var isEdit =
    e.target &&
    (e.target.isContentEditable || tag === "input" || tag === "textarea");

  if (isEdit) {
    return;
  }

  e.preventDefault();
  copySelected(winObj);
}

function onMouseMove(e) {
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;
}

function addDocListener(docObj, winObj) {
  if (!docObj || docObj.__selcopyKeyDone) {
    return;
  }

  docObj.addEventListener("keydown", function (e) {
    onKeyDown(e, winObj);
  });
  docObj.addEventListener("mousemove", onMouseMove, { passive: true });
  docObj.__selcopyKeyDone = true;
}

function initListener() {
  if (location.href !== currentUrl) {
    currentUrl = location.href;
    console.log(
      "[Break on Copy] URL変更を検知したためイベントリスナを確認します",
    );
  }

  addDocListener(document, window);
}

loadSettei().then(function () {
  initListener();
  setInterval(initListener, 2000);
});

if (browser.storage && browser.storage.onChanged) {
  browser.storage.onChanged.addListener(function (changes, area) {
    if (area === "local" && changes.copy_key_settei) {
      var next = changes.copy_key_settei.newValue;
      if (next) {
        keySettei = {
          shift: !!next.shift,
          ctrl: !!next.ctrl,
          alt: !!next.alt,
          meta: !!next.meta,
          key: (next.key || "c").toLowerCase(),
        };
      }
    }
  });
}
