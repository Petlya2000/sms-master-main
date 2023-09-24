/*
    Material JS is simple UI wrapper tool
    Author: Carterline
    consulive[at]live[dot]com
*/

function print(message)
{
  if (typeof(DEBUG) != 'undefined') console.log(message);
}

/////////////// MAKE RAM CLEAN AGAIN ///////////////

let temporaryElements = [];

HTMLElement.prototype.attachEventListener = function(eventType, callback){
  temporaryElements.push([this, eventType, callback]);
  this.addEventListener(eventType, callback);
};
HTMLElement.prototype.removeEventListeners = function()
{
  let that = this;
  temporaryElements.forEach(function(event, index){
    if (event[0] === that)
    {
      event[0].removeEventListener(event[1], event[2]);
      print(`\x1b[94m[Garbage collector]\x1b[0m event listener manually ${event[1]} removed for disposed element`);
      temporaryElements.splice(index, 1);
    }
  });
}

setInterval(() => {
  temporaryElements.forEach(function(event, index){
    if (!document.body.contains(event[0]))
    {
      event[0].removeEventListener(event[1], event[2]);
      print(`\x1b[94m[Garbage collector]\x1b[0m event listener ${event[1]} removed for disposed element`);
      temporaryElements.splice(index, 1);
    }
  });
}, 1000);
// const observer = new MutationObserver(function(mutations_list) {
// 	mutations_list.forEach(function(mutation) {
// 		mutation.removedNodes.forEach(function(node) {
//       setTimeout(() => {
//         temporaryElements.forEach(function(event, index){
//           if (!document.body.contains(event[0]))
//           {
//             event[0].removeEventListener(event[1], event[2]);
//             print(`\x1b[94m[Garbage collector]\x1b[0m event listener ${event[1]} removed for disposed element`);
//             temporaryElements.splice(index, 1);
//           }
//         });
//       }, 1000);
// 		});
// 	});
// });

// observer.observe(document.querySelector("body"), { subtree: false, childList: true });

////////////////////////////////////////////////////

////////////////// NATIVE WIDGETS //////////////////

class AnimatedOpacity
{
  element;
  constructor({opacity = 1, duration, child})
  {

    this.element = new Container({
      child: child
    });
    this.element.style.opacity = opacity;
    this.element.opacity = opacity;
    this.element.duration = duration;

    this.element.setState = async function(opacity) 
    {
      if (opacity == this.opacity) return;
      this.opacity = opacity;
      let completed = false;
      anime({
        targets: this,
        easing: "easeInOutQuad",
        opacity: opacity,
        duration: this.duration.milliseconds,
        complete: function(animation) {
         completed = animation.completed;
        }
      });
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (completed) {
            clearInterval(interval);
            resolve(completed);
          }
        }, 100);
      });
    }
    this.element.dispose = function()
    {
      this.remove();
    };

    return this.element;
  }
}

class Duration
{
  milliseconds;
  constructor({milliseconds = 0})
  {
    this.milliseconds = milliseconds;
  }
}

class Double
{
  static infinity = '100%';
}

class GestureDetector
{
  constructor({onTap, child})
  {
    child.attachEventListener('click', onTap);
    return child;
  }
}

class MainAxisAlignment
{
  static start = 'flex-start';
  static end = 'flex-end';
  static center = 'center';
  static spaceBetween = 'space-between';
  static spaceAround = 'space-around';
}

class CrossAxisAlignment extends MainAxisAlignment {};

class Column
{
  constructor({
    mainAxisAlignment = MainAxisAlignment.start,
    crossAxisAlignment = CrossAxisAlignment.center,
    mainAxisSize = MainAxisSize.max, 
    children = null
  } = {})
  {
    let element = new Container();
    element.style.display = mainAxisSize;
    element.style.flexDirection = 'column';
    element.style.justifyContent = mainAxisAlignment;
    element.style.alignItems = crossAxisAlignment;
    if (children != null)
    {
      children.forEach(function(child){
        element.appendChild(child);
      });
    }
    return element;
  }
}

class Row
{
  constructor({
    mainAxisAlignment = MainAxisAlignment.start,
    crossAxisAlignment = CrossAxisAlignment.center,
    mainAxisSize = MainAxisSize.max, 
    children = null
  } = {})
  {
    let element = new Container();
    element.style.display = mainAxisSize;
    element.style.flexDirection = 'row';
    element.style.alignItems = mainAxisAlignment;
    element.style.justifyContent = crossAxisAlignment;
    if (children != null)
    {
      children.forEach(function(child){
        element.appendChild(child);
      });
    }

    return element;
  }
}

class Align
{
  constructor({
    child,
    alignment = Alignment.center,
  } = {})
  {
    child.style.position = 'absolute';
    if (alignment[0][0] != 0) child.style.top = alignment[0][0];
    if (alignment[0][1] != 0) child.style.left = alignment[0][0];
    if (typeof(alignment[1]) != 'undefined') child.style.transform = alignment[1];
    return child;
  }
}

class Alignment
{
  static topLeft = [[0,0]];
  static topCenter = [[0,'50%'], 'translateX(-50%)'];
  static topRight = [[0,'100%'], 'translateX(-100%)'];
  static centerLeft = [['50%', 0], 'translateY(-50%)'];
  static center = [['50%','50%'], 'translate(-50%, -50%)'];
  static centerRight = [['50%','100%'], 'translate(-50%, -100%)'];
  static bottomLeft = [['100%',0], 'translateY(-100%);'];
  static bottomCenter = [['100%','50%'], 'translate(-100%, -50%)'];
  static bottomRight = [['100%','100%'], 'translate(-100%, -100%)'];
}

class MainAxisSize
{
  static min = 'inline-flex';
  static max = 'flex';
}

class Container
{
  constructor({width, height, child = null, decoration = null} = {})
  {
    let element = document.createElement('div');
    element.style.width = (typeof(width) == 'number' ? width + 'px' : width);
    element.style.height = (typeof(height) == 'number' ? height + 'px' : height);
    if (child != null) element.appendChild(child);
    return element;
  };
}

class BorderRadius
{
  static circular = function(px)
  {
    return px + "px;";
  };
}

class Offset
{
  static zero = '0px 0px';
  constructor(dx, dy)
  {
    return `${dx}px ${dy}px`;
  }
}

class Color
{
  value;
  constructor(hex)
  {
    console.log(hex);
    hex = hex.toString(16);
    console.log(hex);
    let a = ByteToDouble(parseInt(hex.substring(0,2), 16)),
        r = parseInt(hex.substring(2,4), 16),
        g = parseInt(hex.substring(4,6), 16),
        b = parseInt(hex.substring(6,8), 16);
    this.value = `rgba(${r}, ${g}, ${b}, ${a})`;
  }
}
class BoxShadow
{
  constructor({
    color = new Color(0xFF000000),
    offset = Offset.zero,
    blurRadius = 0.0,
    spreadRadius = 0.0
  })
  {
    return `${offset} ${blurRadius} ${spreadRadius} ${color.value}`;
  }
}

class BoxDecoration
{
  value;
  constructor({color, borderRadius, boxShadow} = {})
  {
    
  }
}

function ByteToDouble(byte)
{
  byte = Math.max(0, Math.min(255, byte));
  var mappedValue = byte / 255;
  if (mappedValue > 0.5) {
    mappedValue = (mappedValue - 0.5) * 2;
  } else {
    mappedValue = mappedValue * 2;
  }
  return mappedValue.toFixed(2);
};

////////////////// END OF NATIVE WIDGETS //////////////////





class AlertModal
{
  constructor({header, content, children})
  {
    if (Array.isArray(children))
    {
      let element = new Container({
        child: new Container()
      });
      element.classList.add("errorModal");
      element.appendChild(document.createElement('div'));
      let box = element.childNodes[0];
      box.classList.add("innerWrapper");
      box.appendChild(document.createElement('p'));
      box.childNodes[0].textContent = header;
      
      if (typeof content == 'string')
      {
        box.appendChild(document.createElement('p'));
        box.childNodes[1].textContent = content;
      }
      else
      {
        box.appendChild(content);
      }
      
      box.appendChild(document.createElement('div'));
      box.childNodes[2].setAttribute('style', 'display: flex; justify-content: flex-end; margin-right: 10px;');

      children.forEach((child) => {
        box.childNodes[2].appendChild(child);
      });
      return element;
    }
    else
    {
      throw Error(`The argument type '${typeof(children)}' can't be assigned to the parameter type 'Array'`);
    }
  }
}



class AlertModalButton
{
  constructor({text, color, onTap})
  {
    let element = document.createElement('div');
    element.textContent = text;
    element.classList.add("inlineButton", color);
    element.style.whiteSpace = 'nowrap';
    return new GestureDetector({
      onTap: onTap,
      child: element
    });
  }
}

class AlertModalButtons
{
  static blue = 'blue';
  static red = 'red';
  static green = 'green';
}

class BlackoutContainer
{
  constructor({child = null, onTap = null})
  {
    let element = new Container();
    element.classList.add('blackout');
    let subElement = document.createElement('div');
    subElement.style.width = '100%';
    subElement.style.height = '100%';
    subElement.style.position = 'absolute';
    if (onTap != null) subElement.attachEventListener('click', onTap);
    element.appendChild(subElement);
    if (child != null) element.appendChild(child);
    return element;
  }
}

// class LoginForm
// {
//   constructor()
//   {
//     return new Align({
//       alignment: Alignment.center,
//       child: new Container({
//         child: new Row({
//           children: [
//             new Container({
//               width: 100,
//               height: 100,
//             }),
//             new Container({
//               width: 100,
//               height: 100,
//             }),
//           ]
//         })
//       })
//     });
//   }
// }