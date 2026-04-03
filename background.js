function sendCopy(tabId) {
  return browser.tabs.sendMessage(tabId, { action: "run_copy" }).catch(function () {
    console.log("[Break on Copy] メッセージ送信に失敗しました");
  });
}

function onDoCommand(name) {
  if (name !== "seikei_copy") {
    return;
  }

  browser.tabs
    .query({ active: true, currentWindow: true })
    .then(function (tabs) {
      if (!tabs || tabs.length === 0) {
        return;
      }
      return sendCopy(tabs[0].id);
    })
    .catch(function () {
      console.log("[Break on Copy] アクティブタブの取得に失敗しました");
    });
}

browser.commands.onCommand.addListener(onDoCommand);
