// This one acts in the context of the panel in the Dev Tools
//
// Can use
// chrome.devtools.*
// chrome.extension.*
var cnt=0;
let arr = new Array();
var filterText = '';
// document.querySelector('#executescript').addEventListener('click', function() {
//     sendObjectToInspectedPage({action: "code", content: "console.log('Inline script executed')"});
// }, false);

document.querySelector('#searchBox').addEventListener('input', function(event) {
    filterText = event.target.value;
    drawRequests();
}, false);

document.querySelector('#requesttab').addEventListener('click', function(event) {
    openPanel(event, 'Request');
}, false);
document.querySelector('#responsetab').addEventListener('click', function(event) {
    openPanel(event, 'Response');
}, false);
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
    document.getElementById(panelName).style.display = "block";
    evt.currentTarget.className += " active";
  }
document.addEventListener('DOMContentLoaded', function () {
    // Query the element
    const resizer = document.getElementById('dragMe');
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
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    };

    const mouseMoveHandler = function (e) {
        // How far the mouse has been moved
        const dx = e.clientX - x;
        const dy = e.clientY - y;

        const newLeftWidth = ((leftWidth + dx) * 100) / resizer.parentNode.getBoundingClientRect().width;
        leftSide.style.width = `${newLeftWidth}%`;

        resizer.style.cursor = 'col-resize';
        document.body.style.cursor = 'col-resize';

        leftSide.style.userSelect = 'none';
        leftSide.style.pointerEvents = 'none';

        rightSide.style.userSelect = 'none';
        rightSide.style.pointerEvents = 'none';
    };

    const mouseUpHandler = function () {
        resizer.style.removeProperty('cursor');
        document.body.style.removeProperty('cursor');

        leftSide.style.removeProperty('user-select');
        leftSide.style.removeProperty('pointer-events');

        rightSide.style.removeProperty('user-select');
        rightSide.style.removeProperty('pointer-events');

        // Remove the handlers of `mousemove` and `mouseup`
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    };

    // Attach the handler
    resizer.addEventListener('mousedown', mouseDownHandler);
});

chrome.devtools.network.onRequestFinished.addListener(request => {
    request.getContent((body) => {
      if (request.request && request.request.url) {
            cnt++;
            arr.push({
                id: cnt, url:request.request.url.substring(request.request.url.lastIndexOf('/') + 1), 
                request: JSON.stringify(request.request), 
                response: body?.replaceAll('\\','').replace(/(^"|"$)/g, '').replaceAll('"{','{').replaceAll('}"','}')
            });
            drawRequests();            
     }
    });
  });

  function drawRequests(){
    document.getElementById("requestList").innerHTML='';
    arr.filter(x=>!filterText || filterText && x.url.toLowerCase().indexOf(filterText.toLowerCase())!==-1).forEach(item=>{
      var node = document.createElement("LI");
      node.setAttribute("id", item.id);
      node.setAttribute("class", "request-item");
      node.addEventListener('click', function(event) {

          [...document.getElementById("requestList").children].forEach(element => {
              element.setAttribute('class','request-item');
          });

          document.getElementById(event.target.id).setAttribute('class','request-item selected-item');
          var respData = arr.find(x=>x.id.toString()===event.target.id).response;
          var reqData = arr.find(x=>x.id.toString()===event.target.id).request;
          responseElem = document.getElementById("Response");
          responseElem.innerHTML = '';
          requestElem = document.getElementById("Request");
          requestElem.innerHTML = '';
          try {
          if(respData){
              var json = JSON.parse(respData);
          }
          responseElem.appendChild(renderjson(json));
          if(reqData) {
              json = JSON.parse(reqData);
          }
          requestElem.appendChild(renderjson(json));
      } catch {
          var textnode = document.createTextNode(arr.find(x=>x.id.toString()===event.target.id).response);
          responseElem.appendChild(textnode);
      }
      }, false);
      var textnode = document.createTextNode(item.url);
      node.appendChild(textnode);
      document.getElementById("requestList").appendChild(node);
    })
}

//   var data = JSON.parse(textnode);
//   document.getElementById("results").appendChild(renderjson(data));