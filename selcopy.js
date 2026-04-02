var currentUrl = "";
var keySettei = {
  shift: true,
  ctrl: false,
  alt: false,
  meta: false,
  key: "c"
};

function testSameOrigin(url) {
  var loc = window.location;
  var a = document.createElement("a");
  a.href = url;
  return a.hostname === loc.hostname && a.port === loc.port && a.protocol === loc.protocol;
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
          key: (saved.key || "c").toLowerCase()
        };
      }
    })
    .catch(function () {
      console.log("[selcopy.js] 設定の読み込みに失敗しました");
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

function copySelected(winObj) {
  var selected = winObj.getSelection().toString();
  var copyText = seikeiText(selected);

  if (copyText !== "") {
    navigator.clipboard.writeText(copyText);
    winObj.getSelection().removeAllRanges();

    new Notification("クリップボードにコピーしました", {
      body: copyText.substr(0, 150),
      icon: browser.runtime.getURL("icons/icon.png")
    });
    console.log("[selcopy.js] ショートカットで選択テキストをコピーしました");
  }
}

function onKeyDown(e, winObj) {
  if (!isKeyMatch(e)) {
    return;
  }

  var tag = (e.target && e.target.tagName ? e.target.tagName : "").toLowerCase();
  var isEdit = e.target && (e.target.isContentEditable || tag === "input" || tag === "textarea");

  if (isEdit) {
    return;
  }

  e.preventDefault();
  copySelected(winObj);
}

function addDocListener(docObj, winObj) {
  if (!docObj || docObj.__selcopyKeyDone) {
    return;
  }

  docObj.addEventListener("keydown", function (e) {
    onKeyDown(e, winObj);
  });
  docObj.__selcopyKeyDone = true;
}

function initListener() {
  if (location.href !== currentUrl) {
    currentUrl = location.href;
    console.log("[selcopy.js] URL変更を検知したためイベントリスナを確認します");
  }

  addDocListener(document, window);

  try {
    var iframes = document.getElementsByTagName("iframe");
    for (var i = 0; i < iframes.length; i++) {
      var frame = iframes[i];
      if (frame.contentDocument && testSameOrigin(frame.contentDocument.location.href)) {
        addDocListener(frame.contentDocument, frame.contentWindow);
      }
    }
  } catch (err) {
    console.log("[selcopy.js] iframeへのイベントリスナ追加でエラーが発生しました");
  }
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
          key: (next.key || "c").toLowerCase()
        };
      }
    }
  });
}

Notification.requestPermission();
