// This one acts in the context of the panel in the Dev Tools

//

// Can use

// chrome.devtools.*

// chrome.extension.*

var cnt = 0;
let arr = new Array();
var filterText = "";
var copyId;
var whatToCopy = "Response";
var open = window.XMLHttpRequest.prototype.open,
  send = window.XMLHttpRequest.prototype.send;
function openReplacement(method, url, async, user, password) {
  this._url = url;
  return open.apply(this, arguments);
}

function sendReplacement(data) {
  if (this.onreadystatechange) {
    this._onreadystatechange = this.onreadystatechange;
  }
  this.onreadystatechange = onReadyStateChangeReplacement;
  return send.apply(this, arguments);
}
function onReadyStateChangeReplacement() {
  if (this._onreadystatechange) {
    return this._onreadystatechange.apply(this, arguments);
  }
}

window.XMLHttpRequest.prototype.open = openReplacement;
window.XMLHttpRequest.prototype.send = sendReplacement;
document.querySelector("#clearAll").addEventListener(
  "click",
  function () {
    clearAll();
  },
  false
);

document.querySelector("#clearAll").addEventListener(
  "click",
  function () {
    clearAll();
  },
  false
);
document.querySelector("#copyJson").addEventListener(
  "click",
  function () {
    copyJson();
  },
  false
);
document.querySelector("#searchBox").addEventListener(
  "input",
  function (event) {
    filterText = event.target.value;
    drawRequests();
  },
  false
);

document.querySelector("#requesttab").addEventListener(
  "click",
  function (event) {
    openPanel(event, "Request");
  },
  false
);

document.querySelector("#responsetab").addEventListener(
  "click",
  function (event) {
    openPanel(event, "Response");
  },
  false
);

function openPanel(evt, panelName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  whatToCopy = panelName;
  document.getElementById(panelName).style.display = "block";
  evt.currentTarget.className += " active";
}

document.addEventListener("DOMContentLoaded", function () {
  // Query the element
  const resizer = document.getElementById("dragMe");
  const leftSide = resizer.previousElementSibling;
  const rightSide = resizer.nextElementSibling;
  // The current position of mouse
  let x = 0;
  let y = 0;
  let leftWidth = 0;
  // Handle the mousedown event
  // that's triggered when user drags the resizer
  const mouseDownHandler = function (e) {
    // Get the current mouse position
    x = e.clientX;
    y = e.clientY;
    leftWidth = leftSide.getBoundingClientRect().width;
    // Attach the listeners to `document`
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  };

  const mouseMoveHandler = function (e) {
    // How far the mouse has been moved
    const dx = e.clientX - x;
    const dy = e.clientY - y;
    const newLeftWidth =
      ((leftWidth + dx) * 100) /
      resizer.parentNode.getBoundingClientRect().width;
    leftSide.style.width = `${newLeftWidth}%`;
    resizer.style.cursor = "col-resize";
    document.body.style.cursor = "col-resize";
    leftSide.style.userSelect = "none";
    leftSide.style.pointerEvents = "none";
    rightSide.style.userSelect = "none";
    rightSide.style.pointerEvents = "none";
  };
  const mouseUpHandler = function () {
    resizer.style.removeProperty("cursor");
    document.body.style.removeProperty("cursor");
    leftSide.style.removeProperty("user-select");
    leftSide.style.removeProperty("pointer-events");
    rightSide.style.removeProperty("user-select");
    rightSide.style.removeProperty("pointer-events");
    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
  };
    resizer.addEventListener("mousedown", mouseDownHandler);
});

chrome.devtools.network.onRequestFinished.addListener((request) => {
  request.getContent((body) => {
    if (
      request.request &&
      request.request.url &&
      request._resourceType === "xhr"
    ) {
      cnt++;
      arr.push({
        id: cnt,
        url: request.request.url.substring(
          request.request.url.lastIndexOf("/") + 1
        ),
        request: request.request,
        response: (() => {
          var resp;
          try {
            resp = JSON.parse(body);
          } catch {
            resp = body;
          }
          return resp;
        })(),
      });
      drawRequests();
    }
  });
});

function drawRequests() {
  document.getElementById("requestList").innerHTML = "";
  arr
    .filter(
      (x) =>
        !filterText ||
        (filterText &&
          x.url.toLowerCase().indexOf(filterText.toLowerCase()) !== -1)
    )
    .forEach((item) => {
      var node = document.createElement("LI");
      node.setAttribute("id", item.id);
      node.setAttribute("class", "request-item");
      node.addEventListener(
        "click",
        function (event) {
          [...document.getElementById("requestList").children].forEach(
            (element) => {
              element.setAttribute("class", "request-item");
            }
          );
          copyId = event.target.id;
          document
            .getElementById(event.target.id)
            .setAttribute("class", "request-item selected-item");
          var respData = arr.find((x) => x.id.toString() === event.target.id).response;
          var reqData = arr.find((x) => x.id.toString() === event.target.id).request;
          responseElem = document.getElementById("Response");
          responseElem.innerHTML = "";
          requestElem = document.getElementById("Request");
          requestElem.innerHTML = "";
          try {
            if (respData) {
              //respDataJSON.parse(respData);
              var respJson = Object.keys(respData).reduce(
                (accumulated, key) => {
                  try {
                    accumulated[key] = JSON.parse(respData[key] || "{}");
                  } catch (e) {
                    accumulated[key] = respData[key];
                  }
                  return accumulated;
                },
                {}
              );
              responseElem.appendChild(renderjson(respJson));
            }
            if (reqData) {
              if (reqData.postData && reqData.postData.text) {
                reqData.postData.text = JSON.parse(reqData.postData.text);
              }
              requestElem.appendChild(renderjson(reqData));
            }
          } catch {
            var textnode = document.createTextNode(
              arr.find((x) => x.id.toString() === event.target.id).response
            );
            responseElem.appendChild(textnode);
          }
        },
        false
      );
      var textnode = document.createTextNode(item.url);
      node.appendChild(textnode);
      document.getElementById("requestList").appendChild(node);
    });
}

function copyJson() {
  copyText = "";
  if (whatToCopy == "Request") {
    copyText = arr.find((x) => x.id.toString() === copyId)?.request;
  }
  if (whatToCopy == "Response") {
    copyText = arr.find((x) => x.id.toString() === copyId)?.response;
  }
  if (copyText) {
    var textArea = document.createElement("textarea");
    textArea.style.position = "fixed";
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = 0;
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    textArea.value = JSON.stringify(copyText);
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      var successful = document.execCommand("copy");
      var msg = successful ? "successful" : "unsuccessful";
      console.log("Copying text command was " + msg);
    } catch (err) {
      console.log("unable to copy");
    }
    document.body.removeChild(textArea);
  }
}

function clearAll() {
  arr = new Array();
  cnt = 0;
  filterText = "";
  document.getElementById("requestList").innerHTML = "";
  document.getElementById("Request").innerHTML = "";
  document.getElementById("Response").innerHTML = "";
}
