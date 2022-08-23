// Chrome automatically creates a background.html page for this to execute.
// This can access the inspected page via executeScript
//
// Can use:
// chrome.tabs.*
// chrome.extension.*

chrome.tabs.onActivated.addListener((port) => {
  var extensionListener = function (message, sender) {
    if (message.tabId && message.content) {
      //Evaluate script in inspectedPage
      if (message.action === "code") {
        chrome.scripting.executeScript({
            target: {tabId: message.tabId},
            args: [{ code: message.content }],
          });
        //Attach script to inspectedPage
      } else if (message.action === "script") {
        chrome.scripting.executeScript({
            target: {tabId: message.tabId},
            args: [{ file: message.content }],
          });

        //Pass message to inspectedPage
      } else {
        chrome.scripting.executeScript({
            target: {tabId: message.tabId},
            args: [ message],
          });
      }

      // This accepts messages from the inspectedPage and
      // sends them to the panel
    } 
  };

  // Listens to messages sent from the panel
  chrome.tabs.onActivated.addListener(extensionListener);

  chrome.tabs.onRemoved.removeListener(extensionListener);

});
