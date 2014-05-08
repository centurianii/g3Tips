/********************************Object measure*********************************
 * Defines utility methods that calculate dimensions and position of an element,
 * window, document or viewport. In case of an element, a collision detection
 * method exists.
 * @module {g3.measure}
 *
 * @version 0.2
 * @author Scripto JS Editor by Centurian Comet.
 * @copyright MIT licence.
 ******************************************************************************/
(function(g3, window, document, undefined){
/*
 * Add necessary functions from 'g3.utils' namespace.
 */
g3.utils = g3.utils || {};
g3.utils.type = (typeof g3.utils.type === 'function')? g3.utils.type : function (obj){
   if(obj === null)
      return 'null';
   else if(typeof obj === 'undefined')
      return 'undefined';
   return Object.prototype.toString.call(obj).match(/^\[object\s(.*)\]$/)[1].toLowerCase();
};

/********************************Function measure*******************************
 * Defines utility methods that calculate dimensions and position of an element,
 * window, document or viewport. In case of an element, a collision detection
 * method exists.
 * When the passed argument is a string, not one between 'screen', 'viewport' 
 * and 'document', it extracts the value and the unit and returns an object of 
 * the form {'value': value, 'unit': value}.
 * @module {g3.measure}
 * @public
 * @param {String|Object} 'el' is a string or a node reference that we want to 
 * calculate.
 * @param {Window} 'win' is the window reference of the document or if null, the 
 * current one.
 * @return {Object} Depending on passed 'el' argument the returning object 
 * contains different properties. If argument is
 * - window.screen or 'screen': {'width': value, 'height': value}
 * - 'viewport': {'left': value, 'top': value, 'width': value, 'height': value},
 *               'left' and 'top' values give the amount of scroll.
 * - 'document': {'width': value, 'height': value}
 * - 'string': {'value': value, 'unit': value} parses css values extracting 
 *             the number from the unit part. If there is not a unit, it uses 
 *             'px' by default. If number can't be found, returns null.
 * - node reference: returns these values on built 
 *      {'outerWidth': value, 'innerWidth': value, 'outerHeight': value, 
 *       'innerHeight': value, 'width': value, 'height': value, 'left': value, 
 *       'top': value, 'viewLeft': value, 'viewTop': value, 'viewRight': value, 
 *       'viewBottom': value, 'visible': value}. Axis start on upper left 
 *       corner. Horizontal axis expands to the right. Vertical axis expand to 
 *       the bottom. Outer* values include border + padding + content. Inner* 
 *       values don't include border. Property 'visible' is true if the element 
 *       is visible on viewport, false if not or, a string that is built up from 
 *       the words: top, right, bottom and left if the relevant sides of the 
 *       element are visible.
 *
 * @object {g3.measure(el)} when argument 'el' is a node reference
 * @public
 *
 * @function {g3.measure(el).intersect}
 * @public
 * @return {String|Boolean} It returns true, false as 'visible()' and in case of 
 * partial visibility, an object {'viewLeft': value, 'viewTop': value, 'width': 
 * value, 'height': value} of the intersection between viewport and element's 
 * area which is considered as the one who contains border + padding + content.
 * @function {g3.measure(el).difference}
 * @public
 * @return {String|false} It returns false if element is not visible and in all
 * other cases it calculates the distances of the element from the edges of the 
 * viewport returning an object {'left': value, 'top': value, 'right': value,
 * 'bottom': value}. The element's area is considered as the one who contains 
 * border + padding + content.
 *
 * @version 0.3
 * @author Scripto JS Editor by Centurian Comet.
 * @copyright MIT licence.
 ******************************************************************************/
   g3.measure = function(el, win){
      if(!win || (win.self !== win) || (win.window !== win))
         win = window;

      var width,
          height,
          left,
          top;
      
      if((el === win.screen) || (el === 'screen')){
         if(el === 'screen')
            el = win.screen;
         return {'width': el.width, 'height': el.height};
      }else if(el === 'viewport'){
         left = win.document.documentElement.scrollLeft || win.document.body.parentNode.scrollLeft || win.document.body.scrollLeft || win.pageXOffset;
         top = win.document.documentElement.scrollTop || win.document.body.parentNode.scrollTop || win.document.body.scrollTop || win.pageYOffset;
         width = win.document.documentElement.clientWidth;
         height = win.document.documentElement.clientHeight;
         return {'left': left, 'top': top, 'width': width, 'height': height};
      }else if((el === win.document) || (el === 'document')){
         if(el === 'document')
            el = win.document;
         width = win.document.documentElement.scrollWidth;
         height = win.document.documentElement.scrollHeight;
         return {'width': width, 'height': height};
      }else if(el && (typeof el === 'object') && (el.nodeType === 1)){
         var outerWidth = el.offsetWidth,
             innerWidth = el.clientWidth,
             outerHeight = el.offsetHeight,
             innerHeight = el.clientHeight;
         var obj = {
            'outerWidth': outerWidth,
            'innerWidth': innerWidth,
            'outerHeight': outerHeight,
            'innerHeight': innerHeight,
            //intersection with viewport, returns true|false|object
            //where object={'viewLeft': left, 'viewTop': top, 'width': width, 'height': height}
            //includes border + padding + content
            intersect: function(){return _intersect.call(this, win);},
            //difference with viewport, returns false|object
            //where object={'left': value, 'top': value, 'right': value, 'bottom': value} 
            //excluded area includes element's border + padding + content
            difference: function(){return _difference.call(this, win);}
         };
         //sets 'width', 'height'
         _size.call(obj, el, win);
         //sets 'left', 'top', 'viewLeft', 'viewTop', 'viewBottom', 'viewRight'
         _position.call(obj, el, win);
         //sets 'visible'
         _visible.call(obj, win);
         return obj;
      }else if(typeof el === 'number')
         return {'value': el, 'unit': 'px'};
      else if((typeof el === 'string') && (el !== '')){
         var tmp = el.match(/[^\+\-\s0-9\.;]+/gi),
             unit;
         if(!tmp)
            unit = 'px';
         else
            unit = tmp[0];
         tmp = parseFloat(el);
         //try to avoid this interpreter bug (or ECMA 'standard'): isNaN(null) === false! (get lost!%@)
         //although: isNaN(parseFloat(null)) === true! (correct)
         if(isNaN(tmp))
            return null;
         else
            return {'value': tmp, 'unit': unit};
      }else
         return null;
      
      function _size(el, win){
         var width, height;
         if(win.getComputedStyle){
            width = parseFloat(win.getComputedStyle(el).getPropertyValue('width'));
            height = parseFloat(win.getComputedStyle(el).getPropertyValue('height'));
         //IE<=8
         }else if(el.currentStyle){
            width = parseFloat(el.currentStyle.getAttribute('width'));
            height = parseFloat(el.currentStyle.getAttribute('height'));
         //padding errors!
         }else{
            width = this['innerWidth'];
            height = this['innerHeight'];
         }
         this['width'] = width;
         this['height'] =  height;
         return this;
      }
      
      function _position(el, win){
         //use viewport
         _inViewport.call(this, el, win);
         if(el.getBoundingClientRect){
            var view = g3.measure('viewport', win);
            this['left'] =  this['viewLeft'] + view['left'];
            this['top'] = this['viewTop'] + view['top'];
         }
         return this;
      }
      
      function _inViewport(el, win){
         if(el.getBoundingClientRect){
            var tmp = el.getBoundingClientRect();
            this['viewTop'] = tmp['top'];
            this['viewLeft'] = tmp['left'];
            this['viewBottom'] = tmp['bottom'];
            this['viewRight'] = tmp['right'];
         }else{
            var view = g3.measure('viewport', win);
            //move tree upwards
            var x = 0, y = 0;
            while(el != null){
               x += el.offsetLeft;
               y += el.offsetTop;
               el = el.offsetParent;
            }
            this['left'] =  x;
            this['top'] = y;
            this['viewTop'] = this['top'] - view['top'];
            this['viewLeft'] = this['left'] - view['left'];
            this['viewBottom'] = this['viewTop'] + this['outerHeight'];
            this['viewRight'] = this['viewLeft'] + this['outerWidth'];
         }
         return this;
      }
      
      function _visible(win){
         var view = g3.measure('viewport', win),
             result = 0;
         //x-axis collision: right, left sides
         if((this['viewTop'] < view['height']) && (this['viewBottom'] > 0)){
            if((this['viewRight'] >= 0) && (this['viewRight'] <= view['width']))
               result += 2;
            if((this['viewLeft'] >= 0) && (this['viewLeft'] <= view['width']))
               result += 8;
         }
         //y-axis collision: top, bottom sides
         if((this['viewRight'] > 0) && (this['viewLeft'] < view['width'])){
            if((this['viewTop'] >= 0) && (this['viewTop'] <= view['height']))
               result += 1;
            if((this['viewBottom'] >= 0) && (this['viewBottom'] <= view['height']))
               result += 4;
         }
         //now binary 'result' contains false or side collision with this order:
         //left-bottom-right-top
         if(result === 0)
            this.visible = false;
         else if(result === 15)
            this.visible =  true;
         else{
            var tmp, res = '';
            tmp = result & parseInt('0001', 2);
            if(Number(tmp).toString(2).slice(0, 1) === '1')
               res += 'top ';
            tmp = result & parseInt('0010', 2);
            if(Number(tmp).toString(2).slice(0, 1) === '1')
               res += 'right ';
            tmp = result & parseInt('0100', 2);
            if(Number(tmp).toString(2).slice(0, 1) === '1')
               res += 'bottom ';
            tmp = result & parseInt('1000', 2);
            if(Number(tmp).toString(2).slice(0, 1) === '1')
               res += 'left';
            res = res.replace(/^\s+|\s+$/g, '');
            this.visible = res;
         }
      }
      
      function _intersect(win){
         var visible = this.visible,
             viewport = g3.measure('viewport', win),
             viewLeft, viewTop, width, height;
         
         if(visible === true)
            return true;
         if(visible === false)
            return false;
         //left, width
         if(visible.indexOf('left') >= 0){
            viewLeft = this.viewLeft;
            if(visible.indexOf('right') >= 0)
               width = this.outerWidth;
            else
               width = viewport.width - this.viewLeft;
         }else{
            viewLeft = 0;
            if(visible.indexOf('right') >= 0)
               width = this.viewRight;
            else
               width = viewport.width;
         }
         //top, height
         if(visible.indexOf('top') >= 0){
            viewTop = this.viewTop;
            if(visible.indexOf('bottom') >= 0)
               height = this.outerHeight;
            else
               height = viewport.height - this.viewTop;
         }else{
            viewTop = 0;
            if(visible.indexOf('bottom') >= 0)
               height = this.viewBottom;
            else
               height = viewport.height;
         }
         return {'viewLeft': viewLeft, 'viewTop': viewTop, 'width': width, 'height': height};
      }
      
      function _difference(win){
         var visible = this.visible,
             viewport = g3.measure('viewport', win),
             left, top, right, bottom;
         
         if(visible === false)
            return false;
         if(visible === true)
            visible = 'top right bottom left';
         //left
         if(visible.indexOf('left') >= 0)
            left = this.viewLeft;
         else
            left = 0;
         //right
         if(visible.indexOf('right') >= 0)
            right = viewport.width - this.viewRight;
         else
            right = 0;
         //top
         if(visible.indexOf('top') >= 0)
            top = this.viewTop;
         else
            top = 0;
         //bottom
         if(visible.indexOf('bottom') >= 0)
            bottom = viewport.height - this.viewBottom;
         else
            bottom = 0;
         return {'left': left, 'top': top, 'right': right, 'bottom': bottom};
      }
   };
}(window.g3 = window.g3 || {}, window, document));