var defaultSettei = {
  shift: true,
  ctrl: false,
  alt: false,
  meta: false,
  key: "c"
};

function normalizeKey(oneKey) {
  if (!oneKey) {
    return "c";
  }
  return oneKey.toLowerCase().slice(0, 1);
}

function getInputSettei() {
  return {
    shift: document.getElementById("shift").checked,
    ctrl: document.getElementById("ctrl").checked,
    alt: document.getElementById("alt").checked,
    meta: document.getElementById("meta").checked,
    key: normalizeKey(document.getElementById("key").value)
  };
}

function showSettei(data) {
  document.getElementById("shift").checked = !!data.shift;
  document.getElementById("ctrl").checked = !!data.ctrl;
  document.getElementById("alt").checked = !!data.alt;
  document.getElementById("meta").checked = !!data.meta;
  document.getElementById("key").value = normalizeKey(data.key);
}

function loadSettei() {
  browser.storage.local.get("copy_key_settei").then(function (res) {
    var data = res.copy_key_settei || defaultSettei;
    showSettei(data);
  });
}

function saveSettei() {
  var data = getInputSettei();
  browser.storage.local.set({ copy_key_settei: data }).then(function () {
    document.getElementById("msg").textContent = "設定を保存しました。";
  });
}

document.getElementById("save").addEventListener("click", saveSettei);
document.getElementById("key").addEventListener("input", function (e) {
  e.target.value = normalizeKey(e.target.value);
});

loadSettei();
