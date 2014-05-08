/**********************************Class Tips***********************************
 * A tooltip class for web pages. It behaves nicely with or without javascript.
 * It is flex- and respond-awared, it can use a subset of presented styles and 
 * can be enhanced with numerous new css3 effects.
 * @module {g3.Tips}
 *
 * @version 0.1
 * @author Scripto JS Editor by Centurian Comet.
 * @copyright MIT licence.
 ******************************************************************************/
(function(g3, $, window, document){
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
g3.utils.getWindow = (typeof g3.utils.getWindow === 'function')? g3.utils.getWindow : function(node){
   if(node && node.ownerDocument){
      return node.ownerDocument.defaultView || node.ownerDocument.parentWindow;
   }else{
      while(node.parentNode)
         node = node.parentNode;
      return node.defaultView || node.parentWindow;
   }
   return window;
};
g3.utils.Array = (typeof g3.utils.Array === 'object')? g3.utils.Array : {
   indexOf: function(){
      if (!Array.prototype.indexOf || ([0, 1].indexOf(1, 2) != -1)){
         Array.prototype.indexOf = function (searchElement, fromIndex){
            if ( this === undefined || this === null ){
               throw new TypeError( '"this" is null or not defined' );
            }
            var length = this.length >>> 0; // Hack to convert object.length to a UInt32
            fromIndex = +fromIndex || 0;
            if (Math.abs(fromIndex) === Infinity){
               fromIndex = 0;
            }
            if (fromIndex < 0){
               fromIndex += length;
               if (fromIndex < 0){
                  fromIndex = 0;
               }
            }
            for (;fromIndex < length; fromIndex++){
               if (this[fromIndex] === searchElement){
                  return fromIndex;
               }
            }
            return -1;
         };
      }
   }
};
g3.utils.Array.indexOf();
g3.utils.clearString = (typeof g3.utils.clearString === 'function')? g3.utils.clearString : function(str, delim){
   var props, 
       arr, 
       reg,
       i;
   
   if((typeof str !== 'string') || !str || (typeof delim !== 'string') || !delim)
      return str;
   //get properties from arguments
   props = Array.prototype.slice.call(arguments, 2);
   if(props.length === 0)
      return str;
   //build regex
   for(i = 0; i < props.length; i++){
      if(g3.utils.type(props[i]) === 'regexp')
         props[i] = '(?:' + props[i].source + ')';
      else if((g3.utils.type(props[i]) === 'string') || (g3.utils.type(props[i]) === 'number'))
         props[i] = '(?:' + props[i] + ')';
      else{
         props.splice(i, 1);
         i--;
      }
   }
   if(props.length === 0)
      return str;
   reg = new RegExp(props.join('|'), 'gi');
   //delete strings separated by delim
   arr = str.split(delim);
   for(i = 0; i < arr.length; i++){
      if(arr[i].search(reg) !== -1){
         arr.splice(i, 1);
         i--;
      }
   }
   str = arr.join(delim);
   return str;
}

/**********************************Class Tips***********************************
 * Public class 'g3.Tips'.
 * A tooltip class for web pages.
 * @module {g3}
 * @constructor
 * @param {Object} 'win' the window object that defaults to 'window'.
 * @return {} None because we use a class library. Initialization is passed to
 * private function 'init()'.
 * @function {g3.css.StyleSheetList.getNative}
 * @public
 * @return {Object} Returns the native styleSheet list.
 * @function {g3.css.StyleSheetList.item}
 * @public
 * @param {Number} 'n' an index in the native styleSsheet list.
 * @return {styleSheet} Returns a normalized 'g3.css.StyleSheet' object built 
 * from a native one found at index 'n'.
 *
 * @version 0.1
 * @author Scripto JS Editor by Centurian Comet.
 * @copyright MIT licence.
 * @reference

 ******************************************************************************/
g3.Tips = g3.Class({
   constructor: function(options){
      if(typeof options === 'string')
         return g3.Tips.get(options);
      
      if(g3.utils.type(options) !== 'object')
         throw new g3.Error('Tip constructor failed. No options were given. Nothing stored to g3.Tips::instances array.', 'Error.Tips.g3', new Error());
      
      //destroy & delete in options
      if(options['destroy']){
         g3.Tips.destroy(options['destroy']);
         //should not delete again on repetitive calls of 'init()'!
         delete options['destroy'];
      }
     
      //pre-initialization action
      options.name = (options.name)? options.name: g3.Tips.defaults.name;
      
      //activate plugins
      for(var i = 0; i < g3.Tips.plugins.length; i++)
         g3.Class.extend(this, g3.Tips.plugins[i].plugin, false, 'function');
      
      //store object in class's list
      g3.Tips.add(options.name, this);
      this.init(options);
   },
   /* 
    * MVC initial state
    * -----------------
    * the initial data state diagram
    */
   STATIC: {
      defaults: {
      /*
       * Model
       * =====
       */
         /*
          * Object
          * ------
          */
         /* name of stored object, should provide your own names */
         name: 'g3Tips',
         
         /* see 'addStyled' */
         selectors: ['.tip'],
         
         /*
          * Nodes
          * -----
          */
         /* parent node whose children will be searched for */
         parent: '',
         
         /* adds in selection existed styled nodes with selectors from 
          * this.selectors */
         addStyled: false,
         
         /* adds in selection nodes having the 'title' property, 
          * it also uses their titles */
         addTitled: false,
         
         /* automatically fill nodes by the external library */
         autoFill: true,
         
         
         /* a temp node collection during initialization given by an external 
          * library like jquery */
         nodes: [],
         
         /* on 'convert' */
         special: ['OBJECT', 'IMG', 'FORM', 'LABEL', 'INPUT', 'SELECT', 'TEXTAREA', 'DATALIST', 'OUTPUT', 'METER', 'PROGRESS'],
         
      /*
       * View
       * ====
       */
         /* what tag to use when wrapping form elements on 'convert' */
         originTag: 'div',
         
         /* what tag to use as tooltip when creating tooltips on 'convert' */
         titleTag: 'span',
         
         /* what tag to use as handler when creating tooltips on 'convert' */
         handlerTag: 'span',
         
         /* convert/create tooltips with one of values: [false|true] */
         convert: false,
         
         /* one of values: [false] or array[] (false leaves titles unchanged) */
         titles: false,
         
         /* one of values: [false] or [+-<value>[deg]] */
         position: false,
         
         /* one of values: [false|+-n<unit>] (false leaves handler to css rules, 
          * +-<unit> sets style left or top of tooltip) */
         handlerTip: false,
         
         /* one of values: [false|+-n<unit>] (false leaves handler to css rules, 
          * +-<unit> sets style left or top of origin) */
         handlerOrigin: false,
         
         /* whether the tooltip will have visible triangle handler */
         displayHandler: true,
         
         /* one of values: [true|false] (true uses js to reposition the 
          * tooltip) */
         optimize: false,
         
         /* one of values: [true|false] (true always display the tooltip) */
         displayTip: false,
         
         /* one of values: [true|false] (true uses js to make tooltip follow the
          * mouse pointer) */
         trackMouse: false,
         
         /* distance from mouse */
         mouseDistance: '20px',
         
         /* overwrite/use animation for tooltips [styled|<selector>|false|true] 
          * ('styled' leaves animation unchanged, '<selector>' changes animation 
          * to this css rule, true uses a js animation, false removes only styled
          * animations and reverts to style 'css') */
         animation: 'styled',
         
         /*if animation == true we have js animation with this duration*/
         duration: '200ms',
         
         /* on mouse enter */
         animationIn: 'easeInOutExpo',
         
         /* on mouse leave */
         animationOut: 'easeInOutExpo',
         
         /* this value is related with css styles*/
         from: '80%',
         
         /* this value is related with css styles*/
         to: '100%',
         
         /* ms before tooltip is opened */
         delayIn: '200ms',
         
         /* ms before tooltip is closed */
         delayOut: '200ms',
         
         eventIn: 'mouseenter focus click',
         
         eventOut: 'mouseleave blur',
         
      /*
       * Controller
       * ==========
       */
         off: false, //{handlerTip: false, handlerOrigin: [true|false], optimize: [true|false], trackMouse: [true|false], animation: [true|false]}
      },
      
      instances: [],
      
      plugins: [],
      
      library: function(lib){
         if(lib === 'jquery'){
            //connect the static members between the 2 libraries
            $.g3Tips = g3.Tips;
               
            $.fn.g3Tips = function(options, fill){
               //1. connect library instance with the static members
               if((g3.utils.type(options) === 'null') || (g3.utils.type(options) === 'undefined'))
                  return $.g3Tips;
               //2. return an instance of g3.Tips based on name and update instance's options.nodes & reference to jquery
               else if(g3.utils.type(options) === 'string')
                  return g3.Tips.get(options, 'jquery', this, fill);
               //3. nothing to do
               else if(!(g3.utils.type(options) === 'object'))
                  return this;
               //4. create an instance
               if(options['destroy']){
                  g3.Tips.destroy(options['destroy']);
                  //should not delete again on repetitive re-entries!
                  delete options['destroy'];
               }
               
               //set options.nodes
               if(g3.utils.type(options.nodes) !== 'array')
                  options.nodes = [];
               if((options.autoFill === true) || ((options.autoFill !== false) && (g3.Tips.defaults.autoFill === true)))
                  options.nodes = this.add(options.nodes).get();
               
               //it breaks jquery but, public instance method this.end/to('jquery') returns it!
               var obj = new g3.Tips(options);
               
               //store library reference
               obj.addLibrary('jquery', this);
               
               return obj;
            }
         }
         //other libraries go here...
         return this;
      },
      
      plugin: function(obj){
         if(g3.utils.type(obj) !== 'object')
            return this;
         
         if(!obj.name)
            throw new g3.Error('No plugin name found. Nothing stored to g3.Tips::plugins array.', 'Error.Tips.g3', new Error());
         
         for(var i = 0; i < g3.Tips.plugins.length; i++)
            if(g3.Tips.plugins[i].id === obj.name)
               throw new g3.Error('Plugin name collision. Nothing stored to g3.Tips::plugins array.', 'Error.Tips.g3', new Error());
         
         g3.Tips.plugins.push({'id': obj.name, 'plugin': obj});
         
         return this;
      },
      
      //g3.Tips.destroy() doesn't show the same tolerance like g3.Tips.get()
      //it's more strict like g3.Tips.add()
      destroy: function(name){
         var head;
         for(var i = 0; i < g3.Tips.instances.length; i++){
            if(g3.Tips.instances[i].id === name){
               
               //1. destroy embedded style sheet
               head = g3.Tips.instances[i].tip.instance.win.document.getElementsByTagName('head')[0];
               $('#' + name, head).remove();
               
               //2. detach event handlers & re-apply classes & style
               g3.Tips.instances[i].tip.init({off: 'handlerTip handlerOrigin optimize trackMouse animation'});
               
               //3. delete node data
               g3.Tips.instances[i].tip.instance.$allNodes.each(function(){
                  delete $(this).data('tip');
               });
               
               //4. destroy object
               g3.Tips.instances[i].tip = null;
               g3.Tips.instances.splice(i, 1);
               
               return this;
            }
         }
         return this;
      },
      
      //get object from 'g3' namespace or from library
      //to get al the list don't supply argument
      //if one is found, it returns it as object and not as array of objects
      //if none is found, it returns null
      //when it is used from within a library you can specify two more arguments
      //which is the name of the library and its reference that will replace the
      //current one to allow object-to-library chaining!
      get: function(name){
         var tmp = [],
             libName = arguments[1], //passed implicitly by the library!
             lib = arguments[2], //passed implicitly by the library!
             fill = arguments[3]; //passed implicitly by the library!
         if(g3.utils.type(name) === 'string')
            name = new RegExp('^' + name + '$');
         for(var i = 0; i < g3.Tips.instances.length; i++){
            if(g3.Tips.instances[i].id.search(name) > -1)
               tmp.push(g3.Tips.instances[i].tip);
         }
         
         if(tmp.length === 0)
            return null;
         else{
            
            //1. called from 'g3' namespace!
            if(!libName || !lib)
               return (tmp.length === 1)? tmp[0]: tmp;
            
            //2. called from within a library!
            tmp = tmp[tmp.length - 1];
            tmp.addLibrary(libName, lib);
            
            //set tmp.options.nodes
            if(fill !== false)
               tmp.options.nodes = lib.add(tmp.options.nodes).get();
            
            return tmp;
         }
      },
      
      add: function(id, obj){
         //care for overlaps: change id and obj.options.name
         for(var i = 0; i < g3.Tips.instances.length; i++){
            if(g3.Tips.instances[i].id === id)
               throw new g3.Error('Tip instance name \'' + id + '\' overlaps existing. Nothing stored to g3.Tips::instances array.', 'Error.Tips.g3', new Error());
         }
         g3.Tips.instances.push({'id': id, 'tip': obj});
         return this;
      },
      
      'static-name': 'g3.Tips',
      version: '0.1'
   },
   
   //it should be private but it is called by external libraries!
   //only one library reference per name so it can holds the last library state!
   addLibrary: function(name, lib){
      for(var i = 0; i < this.libraries.length; i++){
         if(this.libraries[i].id === name){
            this.libraries[i]['lib'] = lib;
            return;
         }
      }
      this.libraries.push({'id': name, 'lib': lib});
   },
   
   //continue to jquery after this
   to: function(name){
      //every instance holds only one reference of a specific library
      for(var i = 0; i < this.libraries.length; i++)
         if(this.libraries[i].id === name)
           return this.libraries[i].lib;
   },
   
   //continue to jquery after this
   end: function(name){
      this.to(name);
   },
   
   /*
    * Init function
    * -------------
    * object initialization
    */
   init: function(options){
      //1. it is a fresh build
      if(!this.instance){
         /*
          * MVC transient state: memorized + constants
          * ------------------------------------------
          */
         //1. switchboard
         this.options = $.extend({}, g3.Tips.defaults, options);
         //2. constants
         this.libraries = [];
         if(!options.parent || !options.parent.nodeType)
            this.options.parent = window.document;
         this.options.name = this.options.name.replace(/^\s+|\s+$/g, '');
         //3. memory
         this.instance = {
            name: this.options.name, 
            parent: this.options.parent,
            win: g3.utils.getWindow(this.options.parent),
            firstBuilt: true,
            handler: {}, //stores values passed by options.handlerTip & options.handlerOrigin
            /* stores the 4-state of event handler attachment: 
               a) not attached (null),
               b) to be attached (1), 
               c) attached (true) and 
               d) remove attached (false)
            */
            on: {},
            /* all functions read from this set except getNodes() who writes */
            $nodes: $(),
            /* all event handlers read from this set */
            $allNodes: $()
         };

      //2. it is a method call from an existed object or, the return from a library (jquery.g3Tips('name').init(...))
      }else if(g3.utils.type(options) !== 'object'){
         this.instance.firstBuilt = false;
         return this;
      }else{
         /*
          * MVC transient state: memorized + temporary
          * ------------------------------------------
          * temporary should be reset before processing
          */
         reset(this);
         
         this.options = $.extend({}, this.options, options);
         //revert to initial this.options.name|parent
         this.options.name = this.instance.name;
         this.options.parent = this.instance.parent;

         this.instance.firstBuilt = false;
      }
      
      //correct some critical options that can break the code!
      if(!this.options.originTag)
         this.options.originTag = 'div';
      if(!this.options.titleTag)
         this.options.titleTag = 'span';
      if(!this.options.handlerTag)
         this.options.handlerTag = 'span';
      
      //the 'this' reference used by privileged functions
      var self = this,
          debug = {};

      //to initiate debug: pass in options a key 'debug' with value an external object!
      //collect results through the passed external object!
      debug['getNodes'] = getNodes(); //builds public self.instance.$nodes
      debug['convert'] = convert();
      debug['applyTitle'] = applyTitle();
      debug['applyPosition'] = applyPosition();
      debug['applyHandlerTip'] = applyHandlerTip();
      debug['applyHandlerOrigin'] = applyHandlerOrigin();
      debug['applyDisplayHandler'] = applyDisplayHandler();
      debug['applyOptimize'] = applyOptimize();
      debug['applyDisplayTip'] = applyDisplayTip();
      debug['applyTrackMouse'] = applyTrackMouse();
      debug['applyAnimation'] = applyAnimation();
      debug['applyEvents'] = applyEvents();
      
      //fill in this.options['debug'] object
      if(g3.utils.type(this.options['debug']) === 'object'){
         for(var i in debug)
            this.options['debug'][i] = debug[i];
      }
      delete this.options['debug'];
      
      return this;
   
      /*
       * MVC functions
       * -------------
       * the functional diagram: use of instance variables, 'this.instance' and 
       * options, 'this.options'
       */
      //private privileged function works on public instance variable 'this.options'
      //resets only temporary options which have connected functions
      function reset(self){
         self.options.addStyled = false;
         self.options.addTitled = false;
         self.options.convert = false;
         self.options.titles = false;
         self.options.position = false;
         self.options.handlerTip = false;
         self.options.handlerOrigin = false;
         self.options.optimize = false;
         self.options.trackMouse = false;
         self.options.off = false;
         self.options.animation = 'styled';
      }
      
      //private privileged function works on public instance variable 'this.options'
      function getNodes(){
         var result = false;
         if(self.options.nodes && self.options.nodes.length){
            self.instance.$nodes = $(self.options.nodes);
            self.options.nodes = [];
            result = true;
         }
         
         if(self.options.addStyled && (g3.utils.type(self.options.selectors) === 'array')){
            for(var i = 0; i < self.options.selectors.length; i++){
               self.instance.$nodes = self.instance.$nodes.add($(self.options.selectors[i] + ' > ' + self.options.selectors[i], self.options.parent).parent(self.options.selectors[i]));
            }
            result = true;
         }
         
         if(self.options.addTitled){
            self.instance.$nodes = self.instance.$nodes.add($('[title]', self.options.parent));
            result = true;
         }
         
         if(self.instance.$nodes.length){
            self.instance.$nodes = self.instance.$nodes.map(function(){
               var $n = $(this);
               
               //handle special elements
               if(self.options.special.indexOf(this.nodeName.toUpperCase()) > -1){
                  if(!$n.parent(self.options.originTag).hasClass('tip')){
                     //wrap() returns the original set!
                     $n.wrap('<' + self.options.originTag + '></' + self.options.originTag + '>');
                     return $n.parent(self.options.originTag).addClass('tip_wrap').get(0);
                  }else
                     return $n.parent(self.options.originTag).get(0);
               //handle normal elements
               }else{
                  return this;
               }
            });
            self.instance.$allNodes = self.instance.$allNodes.add(self.instance.$nodes);
         }
         
         return result;
      }
      
      //private privileged function works on public instance variables 'this.instance' and 'this.options'
      function convert(){
         if(!self.options.convert || !self.instance.$nodes.length)
            return false;
         var result = false;
         
         self.instance.$nodes.each(function(){
            var $n = $(this);
            if(!$n.hasClass('tip')){
               var title = $n.attr('title'),
                   tip;
               tip = '<' + self.options.titleTag + ' class="tip css"><' + self.options.handlerTag + ' class="handler"></' + self.options.handlerTag + '>' + title + '</' + self.options.titleTag + '>';
               $n.addClass('tip').removeAttr('title').prepend(tip);
               result = true;
            }
         });
         
         return result;
      }
      
      //private privileged function works on public instance variables 'this.instance' and 'this.options'
      function applyTitle(){
         if(!self.options.titles || !self.instance.$nodes.length || (g3.utils.type(self.options.titles) !== 'array') || (self.options.titles.length === 0))
            return false;
         var result = false;
         //apply to tooltip nodes only!
         self.instance.$nodes.each(function(ndx){
            if(ndx >= self.options.titles.length)
               return false;
            var $n = $(this),
                tmp;
            if($n.hasClass('tip') && $n.children('.tip').length){
               tmp = '<' + self.options.handlerTag + ' class="handler"></' + self.options.handlerTag + '>' + self.options.titles[ndx];
               $n.children('.tip').html(tmp);
               result = true;
            }
         });
         
         return result;
      }
      
      //private privileged function works on public instance variables 'this.instance' and 'this.options'
      //converts all degrees to one of: [0, 90, 180, 270] and
      //applies position whatsoever!
      function applyPosition(){
         if(!self.instance.$nodes.length)
            return false;
         
         var result = false, 
             $n,
             $tip,
             pos,
             tmp,
            //find direction in [0, 360) space
            deg = parseFloat(self.options.position, 10);
         
         //interpreter bug or ECMA 'standard': isNaN(null) === false! (get lost!%@)
         //but isNaN(parseFloat(null)) === true! 
         if(!isNaN(deg)){
            while(deg < 0)
               deg += 360;

            //find closest css rules: 0deg points upwards and moves counter clockwise!
            if(deg <= 45 || deg > 315)
               pos = 'top';
            else if(deg > 45 && deg <= 135)
               pos = 'left';
            else if(deg > 135 && deg <= 225)
               pos = 'bottom';
            else if(deg > 225 && deg <= 315)
               pos = 'right';
            
            result = true;
         }
         
         //apply to tooltip nodes only!
         self.instance.$nodes.each(function(){
            $n = $(this);
            $tip = $n.children('.tip');
            
            if($n.hasClass('tip') && $tip.length){
               if(result){
                  $tip.removeClass('top bottom left right').addClass(pos);
                  setDataPos($n, pos);
                  //retain handler's inline style swapping 'left' with 'top' & update data
                  tmp = $tip.children('.handler').attr('style');
                  if(tmp){
                     if((tmp.indexOf('left') > -1) && (pos === 'left' || pos === 'right')){
                        tmp = tmp.replace(/left/i, 'top');
                        $tip.children('.handler').attr('style', tmp);
                     }else if((tmp.indexOf('top') > -1) && (pos === 'top' || pos === 'bottom')){
                        tmp = tmp.replace(/top/i, 'left');
                        $tip.children('.handler').attr('style', tmp.replace(/top/i, 'left'));
                     }
                     tmp = $n.data('tip');
                     tmp = $.extend(true, tmp, {'handler': {'tip_style': tmp}});
                     $n.data('tip', tmp);
                  }
               }else{
                  //force position class in nodes & set data.tip.pos!
                  tmp = !($tip.hasClass('top') || $tip.hasClass('bottom') || $tip.hasClass('left') || $tip.hasClass('right'));
                  if(tmp){
                     $tip.addClass('right');
                     setDataPos($n, 'right');
                  //set data.tip.pos based on position class
                  }else
                     setDataPos($n);
               }
            }
         });
         
         return result;
      }
      
      //sets 'data.tip.pos' based on existed position if 2nd argument is empty or,
      //stores 2nd argument value to 'data.tip.pos'
      //no node proof-checking here
      function setDataPos($n, pos){
         var tmp,
             $tip = $n.children('.tip');
         
         if(!pos){
            if(!$n.data('tip') || !$n.data('tip').pos){
               if($tip.hasClass('top'))
                  pos = 'top';
               else if($tip.hasClass('bottom'))
                  pos = 'bottom';
               else if($tip.hasClass('left'))
                  pos = 'left';
               else if($tip.hasClass('right'))
                  pos = 'right';
               else
                  pos = 'right';//exception
            }else
               return;
         }else
            pos = ('top right bottom left'.indexOf(pos) > -1)? pos: 'right';
         tmp = $n.data('tip');
         tmp = $.extend(true, tmp, {'pos': pos});
         $n.data('tip', tmp);
      }
      
      //private privileged function works on public instance variables 'this.instance' and 'this.options'
      function applyHandlerTip(evt){
         if(!self.options.handlerTip || !self.instance.$nodes.length)
            return false;
         
         var tip = self.options.handlerTip, 
             tmp = g3.measure(tip), 
             style,
             result = false;

         if(!tmp)
            return false;
         
         //store data & apply style
         self.instance.$nodes.each(function(){
            var $n = $(this),
                $tip = $n.children('.tip');
            
            if($n.hasClass('tip') && $tip.length){
               if(($n.data('tip').pos === 'top') || ($n.data('tip').pos === 'bottom'))
                  style = 'left:' + tip + ';';
               else if(($n.data('tip').pos === 'left') || ($n.data('tip').pos === 'right'))
                  style = 'top:' + tip + ';';
               $tip.children('.handler').attr('style', style);
               
               tmp = $n.data('tip');
               tmp = $.extend(true, tmp, {'handler': {'tip': tip, 'tip_style': style}});
               $n.data('tip', tmp);
               
               result = true;
            }
         });
         
         return result;
      }
      
      //private privileged function works on public instance variables 'this.instance' and 'this.options'
      function applyHandlerOrigin(evt){
         if(!self.options.handlerOrigin || !self.instance.$nodes.length)
            return false;
         
         var origin = self.options.handlerOrigin, 
             $n,
             $tip,
             tmp = g3.measure(origin),
             result = false;
         
         if(!tmp)
            return false;
         
         //store data
         self.instance.$nodes.each(function(){
            $n = $(this);
            $tip = $n.children('.tip');
            
            if($n.hasClass('tip') && $tip.length){
               tmp = $n.data('tip');
               tmp = $.extend(true, tmp, {'handler': {'origin': origin}});
               $n.data('tip', tmp);
               
               result = true;
            }
         });
         
         //(re-)attach event handler as this one writes node data!
         if(result)
            self.instance.on.handlerOrigin = 1;
         
         return result;
      }
      
      /* 
       * distance from origin: set by options and window resize every time. 
       * This actually moves the whole tooltip. A problem of 2 coordinate 
       * systems: Ox(origin->handler) and O'x'(tip->handler), x = x' + OO' where 
       * x == origin and x' == tip respectively but on same units! Suppose we 
       * know x and x' then, OO' = x - x' => OO' = origin-tip distance or the
       * left/top style of tip relative to origin that will be stored in 
       * data.tip.handler.origin_style. OO' is the css style applied at element 
       * $n.children('.tip').
       */
      //private privileged function works on public instance variable 'this.instance'
      function handlerOrigin(evt){
//g3.evaluator.getInstance().console.log('handlerOrigin event: '+(evt?evt+' of type '+evt.type:null));
         var $whichNodes = (evt)? self.instance.$allNodes: self.instance.$nodes;
         
         $whichNodes.each(function(){
            handlerToOriginDistance($(this));
         });
      }
      
      //private privileged function
      //finds, stores & applies the running measurement for the current applied position
      function handlerToOriginDistance($n){
         var $tip = $n.children('.tip'),
             tmp,
             tmp1,
             tip_el,
             tip_unit,
             origin_el,
             origin_unit;
         
         if($n.hasClass('tip') && $tip.length && $n.data('tip') && $n.data('tip').handler && $n.data('tip').handler.origin){
            //1. find handler-to-origin distances
            tmp = g3.measure($n.data('tip').handler.origin);
            origin_el = tmp.value;
            origin_unit = tmp.unit;
            
            //2. find handler-to-tooltip distance
            //if there isn't value in data then, use jquery's 'position()' or, 
            //use 'getComputedStyle()'
            tmp = handlerToTipDistance($n);
            tip_el = tmp.value;
            tip_unit = tmp.unit;
            
            //3. apply to top/bottom
            if($tip.hasClass('top') || $tip.hasClass('bottom')){
               if(tip_unit === '%'){
                  tip_el = tip_el * $tip.outerWidth() / 100;
                  tip_unit = 'px';
               }
               if(origin_unit === '%'){
                  origin_el = origin_el * $n.outerWidth() / 100;
                  origin_unit = 'px';
               }
               //if units aren't the same: convert unit to pixels
               //...
               if(tip_unit === origin_unit){
                  tmp = (origin_el - tip_el) + tip_unit;
                  tmp1 = $n.data('tip');
                  tmp1 = $.extend(true, tmp1, {'handler': {'origin_style': 'left: ' + tmp + ';', 'origin_style_x': 'left: ' + tmp + ';'}});
                  $n.data('tip', tmp1);
                  $tip.attr('style', g3.utils.clearString($tip.attr('style'), ';', '\\btop')).css('left', tmp);
               }
            
            //4. apply to left/right
            }else if($n.children('.tip').hasClass('left') || $n.children('.tip').hasClass('right')){
               if(tip_unit === '%'){
                  tip_el = tip_el * $tip.outerHeight() / 100;
                  tip_unit = 'px';
               }
               if(origin_unit === '%'){
                  origin_el = origin_el * $n.outerHeight() / 100;
                  origin_unit = 'px';
               }
               //if units aren't the same: convert unit to pixels
               //...
               if(tip_unit === origin_unit){
                  tmp = (origin_el - tip_el) + tip_unit;
                  tmp1 = $n.data('tip');
                  tmp1 = $.extend(true, tmp1, {'handler': {'origin_style': 'top: ' + tmp + ';', 'origin_style_y': 'top: ' + tmp + ';'}});
                  $n.data('tip', tmp1);
                  $tip.attr('style', g3.utils.clearString($tip.attr('style'), ';', '\\bleft')).css('top', tmp);
               }
            }
         }
      }
      
      //private privileged function works on public instance variable 'this.instance'
      //finds the running measurement for the current applied position
      function handlerToTipDistance($n){
         var $tip = $n.children('.tip'),
             tmp,
             tip_el,
             tip_unit;
         
         tmp = $tip.children('.handler').position();
         if($tip.hasClass('top') || $tip.hasClass('bottom'))
            tip_el = tmp.left;
         else if($tip.hasClass('left') || $tip.hasClass('right'))
            tip_el = tmp.top;
         tip_unit = 'px';
         if(!tip_el){
            if($tip.hasClass('top') || $tip.hasClass('bottom')){
               try{
                  tmp = g3.measure(self.instance.win.getComputedStyle($tip.children('.handler').get(0)).getPropertyValue('left').replace(/"|'/g, ''));
                  tip_el = tmp.value;
                  tip_unit = tmp.unit;
               }catch(e){
                  tip_el = 50;
                  tip_unit = '%';
               }
            }else if($n.children('.tip').hasClass('left') || $n.children('.tip').hasClass('right')){
               try{
                  tmp = g3.measure(self.instance.win.getComputedStyle($tip.children('.handler').get(0)).getPropertyValue('top').replace(/"|'/g, ''));
                  tip_el = tmp.value;
                  tip_unit = tmp.unit;
               }catch(e){
                  tip_el = 50;
                  tip_unit = '%';
               }
            }
         }
         
         return {value: tip_el, unit: tip_unit};
      }
      
      //private privileged function works on public instance variables 'this.instance' and 'this.options'
      function applyDisplayHandler(){
         if(!self.instance.$nodes.length)
            return false;
         
         var result = false,
             $n,
             $tip,
             res,
             tmp;
         
         //apply to nodes if not already!
         self.instance.$nodes.each(function(){
            $n = $(this);
            $tip = $n.children('.tip');
            
            if($n.hasClass('tip') && $tip.length){
               res = false;
               if(self.options.displayHandler){
                  if($tip.hasClass('no_handler')){
                     $tip.removeClass('no_handler');
                     res = result = true;
                  }
               }else{
                  if(!$tip.hasClass('no_handler')){
                     $n.children('.tip').addClass('no_handler');
                     res = result = true;
                  }
               }
               if(res){
                  tmp = $n.data('tip');
                  tmp = $.extend(true, tmp, {'handler': {'display': self.options.displayHandler}});
                  $n.data('tip', tmp);
               }
            }
         });
         
         return result;
      }
      
      //private privileged function works on public instance variables 'this.instance' and 'this.options'
      function applyOptimize(evt){
         if(!self.options.optimize || !self.instance.$nodes.length)
            return false;
         
         var result = false,
             $n,
             $tip,
             tmp;
         
         //store data
         self.instance.$nodes.each(function(){
            $n = $(this);
            $tip = $n.children('.tip');
            
            if($n.hasClass('tip') && $tip.length){
               tmp = $n.data('tip');
               tmp = $.extend(true, tmp, {'optimize': true});
               $n.data('tip', tmp);
               
               result = true;
            }
         });
         
         //(re-)attach event handler as this one writes node data!
         if(result)
            self.instance.on.optimize = 1;
         
         return result;
      }
      
      
      //private privileged function works on public instance variable 'this.instance'
      function optimize(evt){
//g3.evaluator.getInstance().console.log('optimize event: '+(evt?evt+' of type '+evt.type:null));
         var $whichNodes = (evt)? self.instance.$allNodes: self.instance.$nodes,
             $n,
             origin, 
             $tip, 
             tip, 
             tmp,
             tmp1,             
             difference,
             viewport,
             arr;
         
         $whichNodes.each(function(){
            $n = $(this);
            $tip = $n.children('.tip');
            
            if($n.hasClass('tip') && $tip.length && $n.data('tip') && $n.data('tip').optimize){
               origin = g3.measure($n.get(0), self.instance.win);
               
               //1. get dimensions & viewport collision
               tip = g3.measure($tip.get(0), self.instance.win);

               //2. optimize only semi-visible or, do nothing
               //if((origin.visible !== false) && (typeof tip.visible === 'string')){
               if(origin.visible !== false){
                  //2.i. find maximum visible rectangles on top, bottom, 
                  //left, right around origin that have the same ratio with 
                  //the tooltip.
                  //Problem: given a rectangle (ho, wo) find the maximum 
                  //rectangle that fits inside and follows tooltip's ratio (wt/ht).
                  //Solution: we draw a line on a h-w system, w = (wt/ht)*h; 
                  //every given rectangle (h0, w0) defines 2 lines (vertical, 
                  //horizontal) that intersect the line on 2 points, A at 
                  //(h01=h0, w01 = (wt/ht)*h0) and B at (h02=(ht/wt)*w0, w02=w0). 
                  //Answer: maximum rectangle has w = min(w0, (wt/ht)*h0).
                  difference = origin.difference();
                  viewport = g3.measure('viewport', self.instance.win);
                  arr = [];
                  arr.push({'pos': 'top', 'value': Math.min(viewport.width, tip.outerWidth*difference.top/tip.outerHeight)});
                  arr.push({'pos': 'bottom', 'value': Math.min(viewport.width, tip.outerWidth*difference.bottom/tip.outerHeight)});
                  arr.push({'pos': 'left', 'value': Math.min(difference.left, tip.outerWidth*viewport.height/tip.outerHeight)});
                  arr.push({'pos': 'right', 'value': Math.min(difference.right, tip.outerWidth*viewport.height/tip.outerHeight)});
                  
                  //2.ii. decremental order of widths
                  tmp1 = true;
                  while(tmp1){
                     tmp1 = false;
                     for(var i = 0; i < arr.length-1; i++){
                        if(arr[i].value < arr[i+1].value){
                           tmp = arr[i];
                           arr[i] = arr[i+1];
                           arr[i+1] = tmp;
                           tmp1 = true;
                        }
                     }
                  }
                  
                  //2.iii. remove conflicting styles
                  if(($tip.hasClass('top') || $tip.hasClass('bottom')) && ((arr[0].pos === 'left') || (arr[0].pos === 'right')))
                     $tip.attr('style', g3.utils.clearString($tip.attr('style'), ';', '\\bleft'));
                  else if(($tip.hasClass('left') || $tip.hasClass('right')) && ((arr[0].pos === 'top') || (arr[0].pos === 'bottom')))
                     $tip.attr('style', g3.utils.clearString($tip.attr('style'), ';', '\\btop'));
                  
                  //2.iv. set data
                  //it haven't been reset so, it is a candidate!
                  tmp = $n.data('tip');
                  tmp = $.extend(true, tmp, {'reset': false});
                  $n.data('tip', tmp);
                  
                  //2.v. resize if needed to rectangle
                  if(arr[0].value < tip.outerWidth){
                     $tip.css('width', arr[0].value);
                  }
                  
                  //2.vi. swap & stop measurements
                  $tip.removeClass('top bottom left right').addClass(arr[0].pos);
                  
                  //2.vii. retain handler's inline style swapping 'left' with 'top'
                  tmp = $tip.children('.handler').attr('style');
                  if(tmp){
                     if((tmp.indexOf('left') > -1) && (arr[0].pos === 'left' || arr[0].pos === 'right'))
                        $tip.children('.handler').attr('style', tmp.replace(/left/i, 'top'));
                     else if((tmp.indexOf('top') > -1) && (arr[0].pos === 'top' || arr[0].pos === 'bottom'))
                        $tip.children('.handler').attr('style', tmp.replace(/top/i, 'left'));
                  }
               }
            }
         });
         
         //3. 2nd level of optimizations after css classes have been applied
         self.instance.win.setTimeout(g3.debounce(optimize2, {delay: 50}, evt), 0);
      }
      
      function optimize2(evt){
//g3.evaluator.getInstance().console.log('optimize2 event: '+(evt?evt+' of type '+evt.type:null));
         var $whichNodes = (evt)? self.instance.$allNodes: self.instance.$nodes,
             $n,
             origin, 
             $tip, 
             tip,           
             difference,
             intersect,
             pos,
             tmp;
            
         $whichNodes.each(function(){
            $n = $(this);
            $tip = $n.children('.tip');
            
            if($n.hasClass('tip') && $tip.length && $n.data('tip') && $n.data('tip').optimize){
               origin = g3.measure($n.get(0), self.instance.win);
               
               //4. get dimensions & viewport collision
               tip = g3.measure($tip.get(0), self.instance.win);
               
               //if((origin.visible !== false) && (typeof tip.visible === 'string')){
               if(origin.visible !== false){
                  difference = tip.difference();
                  intersect = tip.intersect();
                  if($tip.hasClass('top'))
                     pos = 'top';
                  else if($tip.hasClass('bottom'))
                     pos = 'bottom';
                  else if($tip.hasClass('left'))
                     pos = 'left';
                  else if($tip.hasClass('right'))
                     pos = 'right';
                  
                  //5. apply origin distance
                  if($n.data('tip').handler && $n.data('tip').handler.origin){
                     if((pos === 'top') || (pos === 'bottom'))
                        if($n.data('tip').handler.origin_style_x)
                           $tip.css('left', $n.data('tip').handler.origin_style_x);
                        else
                           handlerToOriginDistance($n);
                     else if((pos === 'left') || (pos === 'right'))
                        if($n.data('tip').handler.origin_style_y)
                           $tip.css('top', $n.data('tip').handler.origin_style_y);
                        else
                           handlerToOriginDistance($n);
                  }
                  
                  //6. slide tooltips vertically-horizontally
                  if(typeof tip.visible === 'string'){
                     //6.i. favour left visibility
                     if((pos === 'top') || (pos === 'bottom')){
                        if(tip.visible.indexOf('left') === -1){
                           $tip.css('left', '+=' + (tip.outerWidth - intersect.width));
                        }else if(tip.visible.indexOf('right') === -1){
                           $tip.css('left', '-=' + Math.min(tip.outerWidth - intersect.width, difference.left));
                        }
                     }
                     
                     //6.ii. favour top visibility
                     if((pos === 'left') || (pos === 'right')){
                        if(tip.visible.indexOf('top') === -1){
                           $tip.css('top', '+=' + (tip.outerHeight - intersect.height));
                        }else if(tip.visible.indexOf('bottom') === -1){
                           $tip.css('top', '-=' + Math.min(tip.outerHeight - intersect.height, difference.top));
                        }
                     }
                  }
               
               //7. reset optimized nodes
               //}else if((origin.visible === false)){
               }else{
                  //don't care about invisible & reset nodes
                  if($n.data('tip').reset !== true){
                     //7.i. reset position
                     $tip.removeClass('top bottom left right').addClass($n.data('tip').pos);
                     
                     //7.ii. remove conflicting styles
                     //7.iii. reset inline style that controls handler-to-origin position, if exists
                     if($tip.hasClass('top') || $tip.hasClass('bottom')){
                        $tip.attr('style', g3.utils.clearString($tip.attr('style'), ';', '\\btop'));
                        $tip.css('left', $n.data('tip').handler.origin_style);
                     }else if($tip.hasClass('left') || $tip.hasClass('right')){
                        $tip.attr('style', g3.utils.clearString($tip.attr('style'), ';', '\\bleft'));
                        $tip.css('top', $n.data('tip').handler.origin_style);
                     }
                     
                     //7.iv. reset inline style that controls handler-to-tooltip position, if exists
                     if($n.data('tip').handler && $n.data('tip').handler.tip_style){
                        tmp = $n.data('tip').handler.tip_style;
                        $tip.children('.handler').attr('style', tmp);
                     }
                     
                     //7.v. set data
                     tmp = $n.data('tip');
                     tmp = $.extend(true, tmp, {'reset': true});
                     $n.data('tip', tmp);
                  }
               }
            }
         });
      }
      
      //private privileged function works on public instance variables 'this.instance' and 'this.options'
      function applyDisplayTip(){
         if(!self.instance.$nodes.length)
            return false;
         
         var result = false,
             $n,
             $tip,
             res,
             tmp;
         
         //apply to nodes if not already!
         self.instance.$nodes.each(function(){
            $n = $(this);
            $tip = $n.children('.tip');
            
            if($n.hasClass('tip') && $tip.length){
               res = false;
               if(self.options.displayTip){
                  if($tip.hasClass('css')){
                     $tip.removeClass('css').addClass('js');
                     res = result = true;
                  }
               }else{
                  if($tip.hasClass('js')){
                     $tip.removeClass('js').addClass('css');
                     res = result = true;
                  }
               }
               if(res){
                  tmp = $n.data('tip');
                  tmp = $.extend(true, tmp, {'displayTip': self.options.displayTip});
                  $n.data('tip', tmp);
               }
            }
         });
         
         return result;
      }
      
      //private privileged function works on public instance variables 'this.instance' and 'this.options'
      function applyTrackMouse(evt){
         if(!self.options.trackMouse || !self.instance.$nodes.length)
            return false;
         
         var result = false,
             $n,
             $tip,
             tmp;
         
         //1. reset & store data
         self.instance.$nodes.each(function(){
            $n = $(this);
            $tip = $n.children('.tip');
            
            if($n.hasClass('tip') && $tip.length){
               //1.i. hide tooltip
               $tip.removeClass('css js');
               
               //1.v. set data
               tmp = $n.data('tip');
               tmp = $.extend(true, tmp, {'trackMouse': true});
               $n.data('tip', tmp);
               
               //1.vi. set tabindex property for focus/blur
               //jquery attr('tabindex') === undefined but,
               //jquery prop('tabindex') === -1 (!)
               //moreover, ((undefined == null) === true) but ((undefined === null) === false)
               if($n.get(0).tabindex == null)
                  $n.prop('tabindex', '1');
               
               result = true;
            }
         });
         
         //2. (re-)attach event handler to this set nodes!
         if(result)
            self.instance.on.trackMouse = 1;
         
         return result;
      }
      
      //private privileged function works on public instance variable 'this.instance'
      //'this' refers to node
      function trackMouse(evt){
//g3.evaluator.getInstance().console.log('trackMouse event: '+(evt?evt+' of type '+evt.type:null));
         if(!evt)
            return;
         
         var $n = $(this),
             $tip = $n.children('.tip'),
             $handler = $tip.children('.handler'),
             origin = g3.measure(this, self.instance.win),
             style = {x: 0, y: 0},
             tmp,
             tip_el,
             tip_unit;
         
         //1. find handler-to-tooltip distance
         tmp = handlerToTipDistance($n);
         tip_el = tmp.value;
         tip_unit = tmp.unit;
         
         //2. calculate the offsets
         if($tip.hasClass('top') || $tip.hasClass('bottom'))
            style.x = tip_el;
         else if($tip.hasClass('left') || $tip.hasClass('right'))
            style.y = tip_el;
         
         //3. fix tooltip's width
         $tip.css('width', $tip.width());
         
         //4. add mouse distance
         tmp = g3.measure(self.options.mouseDistance);
         if(tmp){
            //convert unit to pixels
            //...
            if($n.data('tip').pos === 'top'){
               style.y += tmp.value + $tip.outerHeight() + $handler.outerHeight();
               $tip.css('bottom', 'auto');
            }else if($n.data('tip').pos === 'bottom')
               style.y -= tmp.value;
            else if($n.data('tip').pos === 'left')
               style.x += tmp.value + $tip.outerWidth() + $handler.outerWidth();
            else if($n.data('tip').pos === 'right')
               style.x -= tmp.value
         }
         
         //5. attach a new event handler per node
         if((evt.type === 'mouseover') || (evt.type === 'focus')){
         //if((evt.type === 'focus')){
            $tip.addClass('js');
            $n.on('mousemove.trackMouse_' + self.options.name + '.tips.g3, click.trackMouse_' + self.options.name + '.tips.g3', {x: origin.left + style.x, y: origin.top + style.y}, trackMouse2);
         }else if((evt.type === 'mouseout') || (evt.type === 'blur')){
         //}else if((evt.type === 'blur')){
            $tip.removeClass('js').attr('style', null);
            $n.off('mousemove click');
         }
      }
      
      function trackMouse2(evt){
         if(!evt)
            return;
         
         var $tip = $(this).children('.tip'),
             x = evt.pageX - evt.data.x,
             y = evt.pageY - evt.data.y;
         
         $tip.css({'left': x, 'top': y});
      }
      
      //private privileged function works on public instance variables 'this.instance' and 'this.options'
      function applyAnimation(){
         var result = false,
             $n,
             $tip,
             tmp,
             cls;
         
         //set animation on converted nodes
         if(self.options.animation === 'styled'){
            self.instance.$nodes.each(function(){
               $n = $(this);
               $tip = $n.children('.tip');
               
               if($n.hasClass('tip') && $tip.length){
                  tmp = $tip.hasClass('transitioned') || $tip.hasClass('animated');
                  if(!tmp){
                     $tip.addClass('transitioned');
                     result = true;
                  }
               }
            });
         }
         
         //remove animation (only styled)
         else if(self.options.animation === false){
            self.instance.$nodes.each(function(){
               $n = $(this);
               $tip = $n.children('.tip');
               
               if($n.hasClass('tip') && $tip.length){
                  $tip.removeClass('transitioned animated');
                  result = true;
               }
            });
         
         //js animation
         }else if(self.options.animation === true){
            
            //1. set data
            self.instance.$nodes.each(function(){
               $n = $(this);
               $tip = $n.children('.tip');
               
               if($n.hasClass('tip') && $tip.length){
                  $tip.removeClass('css js transitioned animated');
                  
                  tmp = $n.data('tip');
                  tmp = $.extend(true, tmp, {'animate': true, 'animateIn': true});
                  $n.data('tip', tmp);
                  
                  result = true;
               }
            });
            
            //2. (re-)attach event handler to this set nodes!
            if(result)
               self.instance.on.animation = 1;
         
         //style selector animation
         }else if(self.options.animation){
            self.instance.$nodes.each(function(){
               $n = $(this);
               $tip = $n.children('.tip');
               
               if($n.hasClass('tip') && $tip.length){
                  $tip.removeClass('transitioned');
                  //find & replace previous animated class
                  tmp = $tip.attr('class').split(' ');
                  cls = ['tip', 'top', 'bottom', 'left', 'right', 'css', 'js'];
                  for(var i = 0; i < tmp.length; i++)
                     if(cls.indexOf(tmp[i]) > -1){
                        tmp.splice(i, 1);
                        i--;
                     }
                  tmp = tmp.join(' ');
                  $tip.removeClass(tmp).addClass('animated ' + self.options.animation);
                  result = true;
               }
            });
         }
         
         return result;
      }
      
      //private privileged function works on public instance variable 'this.instance'
      //'this' refers to node
      //there are two copies of this function that are attached to different groups of events
      function animate(evt){
//g3.evaluator.getInstance().console.log('animate event: '+(evt?evt+' of type '+evt.type:null));
         if(!evt)
            return;
         
         var $n = $(this),
             $tip = $n.children('.tip'),
             $handler = $tip.children('.handler'),
             prop,
             obj,
             from,
             to,
             enter,
             leave;
         
         //1. find position
         if($tip.hasClass('top'))
            prop = 'bottom';
         else if($tip.hasClass('bottom'))
            prop = 'top';
         if($tip.hasClass('left'))
            prop = 'right';
         if($tip.hasClass('right'))
            prop = 'left';
         
         //2. prepare a custom object for animation
         obj = {tip: $tip, handler: $handler, prop1: prop, prop2: 'opacity'};
         from = g3.measure(self.options.from);
         to = g3.measure(self.options.to);
         
         //3. find event type, e.g. either enter or leave
         //3.i. replace 'mouseenter' with 'mouseover' and 'mouseleave' with 'mouseout'
         enter = self.options.eventIn.replace('mouseenter', 'mouseover').replace('mouseleave', 'mouseout');
         leave = self.options.eventOut.replace('mouseenter', 'mouseover').replace('mouseleave', 'mouseout');
         //3.ii. search for event type
         enter = enter.indexOf(evt.type) > -1;
         leave = leave.indexOf(evt.type) > -1;
         
         //4. handle cases of same event types, e.g. on click show or hide tooltip
         //doesn't work for double event calls of 'animate()' that's why 'applyEvents()' should call this one once!
         if(enter === leave === true){
            enter = $n.data('tip').animateIn;
            leave = !$n.data('tip').animateIn;
            $n.data('tip').animateIn = !$n.data('tip').animateIn;
         }
         
         //5. animate
         if(enter){
            obj = $.extend(obj, {value1: from.value, value2: 0});
            
            $(obj).animate({value1: '+=' + (to.value - from.value), value2: 1}, 
            {
               duration: parseFloat(self.options.duration), 
               queue: false, 
               easing: self.options.animationIn, 
               start: function(){
                  this.tip.css({visibility: 'visible', opacity: 0});
                  this.handler.css({visibility: 'visible', opacity: 0});
               },
               done: function(){
                  //this.tip.css({opacity: 1}).css(this.prop1, self.options.to);
                  //this.handler.css({opacity: 1});
                  this.value1 = to.value;
                  this.value2 = 1;
               },
               step: function(now, fx){
                  if(fx.prop == 'value1')
                     this.tip.css(this.prop1, now + from.unit);
                  else if(fx.prop == 'value2'){
                     this.tip.css(this.prop2, now);
                     this.handler.css(this.prop2, now);
                  }
               }
            })
         }else if(leave){
            obj = $.extend(obj, {value1: to.value, value2: 1});
            
            $(obj).animate({value1: '-=' + (to.value - from.value), value2: 0}, 
            {
               duration: parseFloat(self.options.duration), 
               queue: false, 
               easing: self.options.animationOut, 
               start: function(){
                  //this.tip.css({visibility: 'visible', opacity: 1});
                  //this.handler.css({visibility: 'visible', opacity: 1});
                  this.value1 = to.value;
                  this.value2 = 1;
               },
               done: function(){
                  this.tip.css({visibility: 'hidden', opacity: 0});
                  this.handler.css({visibility: 'hidden', opacity: 0});
                  this.value1 = from.value;
                  this.value2 = 0;
               },
               step: function(now, fx){
                  if(fx.prop == 'value1')
                     this.tip.css(this.prop1, now + from.unit);
                  else if(fx.prop == 'value2'){
                     this.tip.css(this.prop2, now);
                     this.handler.css(this.prop2, now);
                  }
               }
            })
         }
      }
      
      function applyEvents(){
         var result = false;
         
         //1. prepare to remove event handlers
         if(g3.utils.type(self.options.off) === 'string'){
            if(self.options.off.indexOf('handlerTip') > -1){
               self.instance.on.handlerTip = false;
               handlerTipRemove(true);
               result = true;
            }
            if(self.options.off.indexOf('handlerOrigin') > -1){
               self.instance.on.handlerOrigin = false;
               handlerOriginRemove(true);
               result = true;
            }
            if(self.options.off.indexOf('optimize') > -1){
               self.instance.on.optimize = false;
               optimizeRemove(true);
               result = true;
            }
            if(self.options.off.indexOf('trackMouse') > -1){
               self.instance.on.trackMouse = false;
               trackMouseRemove(true);
               result = true;
            }
            if(self.options.off.indexOf('animation') > -1){
               self.instance.on.animation = false;
               animationRemove(true);
               result = true;
            }
         }
         
         //2. run event handlers to apply modifications emulating an event call
         //only if, this call does not come from a current re-apply of 'handlerOrigin()' or 'optimize()'
         else {
            if(self.instance.on.handlerOrigin === true)
               handlerOrigin({});
            if(self.instance.on.optimize === true)
               optimize({});
         }
         
         //3. if 1, delete old handlers and attach new ones on the working set
         if(self.instance.on.handlerOrigin === 1){
            $(self.instance.win).off('.handlerOrigin_' + self.options.name);
            $(self.instance.win).on('resize.handlerOrigin_' + self.options.name + '.tips.g3', g3.debounce(handlerOrigin, {delay: 200}));
            self.instance.on.handlerOrigin = true;
            handlerOrigin();
            result = true;
         }
         
         if(self.instance.on.optimize === 1){
            $(self.instance.win).off('.optimize_' + self.options.name);
            $(self.instance.parent).off('.optimize_' + self.options.name);
            $(self.instance.win).on('resize.optimize_' + self.options.name + '.tips.g3', g3.debounce(optimize, {delay: 200}));
            $(self.instance.parent).on('scroll.optimize_' + self.options.name + '.tips.g3', g3.debounce(optimize, {delay: 200}));
            self.instance.on.optimize = true;
            optimize();
            result = true;
         }
         
         if(self.instance.on.trackMouse === 1){
            //remove conflicting events & data
            handlerOriginRemove();
            optimizeRemove();
            animationRemove();
            
            self.instance.$nodes.each(function(){
               var $n = $(this);
               
               $n.off('.trackMouse_' + self.options.name);
               //attach one event handler per node
               $n.on('mouseenter.trackMouse_' + self.options.name + '.tips.g3 mouseleave.trackMouse_' + self.options.name + '.tips.g3 focus.trackMouse_' + self.options.name + '.tips.g3 blur.trackMouse_' + self.options.name + '.tips.g3', g3.debounce(trackMouse, {context: $n.get(0), delay: 50}));
            });
            self.instance.on.trackMouse = true;
            result = true;
         }
         
         if(self.instance.on.animation === 1){
            var $n,
                $tip,
                tmp = '',
                enter,
                leave,
                i;
            
            //remove conflicting events & data
            trackMouseRemove();
            
            //find events
            enter = self.options.eventIn.split(' ');
            for(i = 0; i < enter.length; i++){
               tmp += enter[i] + '.animation_' + self.options.name + '.tips.g3';
               if(i < enter.length - 1)
                  tmp += ' ';
            }
            enter = tmp;
            tmp = '';
            leave = self.options.eventOut.split(' ');
            for(i = 0; i < leave.length; i++){
               tmp += leave[i] + '.animation_' + self.options.name + '.tips.g3';
               if(i < leave.length - 1)
                  tmp += ' ';
            }
            leave = tmp;
            
            //attach one event handler per node
            self.instance.$nodes.each(function(){
               $n = $(this);
               $tip = $n.children('.tip');
               
               $n.off('.animation_' + self.options.name);
               $n.on(enter, g3.debounce(animate, {context: $n.get(0), fireLast: true, delay: parseFloat(self.options.delayIn)}));
               if(enter !== leave)
                  $n.on(leave, g3.debounce(animate, {context: $n.get(0), fireLast: true, delay: parseFloat(self.options.delayOut)}));
            });
            self.instance.on.animation = true;
            result = true;
         }
         
         return result;
      }
      
      //there is no event connected with 'this.applyHandlerTip()' so this one is called by 'g3.Tips.destroy()'
      function handlerTipRemove(all){
         var $whichNodes = (all)? self.instance.$allNodes: self.instance.$nodes,
             $n,
             $tip,
             tmp;
         
         if(!$whichNodes)
            return;
         
         $whichNodes.each(function(){
            $n = $(this);
            $tip = $n.children('.tip');
            
            //remove data
            tmp = $n.data('tip');
            if(tmp && tmp.handler){
               delete tmp.handler.tip;
               delete tmp.handler.tip_style;
            }
            $n.data('tip', tmp);
            $tip.children('.handler').attr('style', null);
         });
      }
      
      function handlerOriginRemove(all){
         var $whichNodes = (all)? self.instance.$allNodes: self.instance.$nodes,
             $n,
             $tip,
             tmp;
         
         if(!$whichNodes)
            return;
         
         $whichNodes.each(function(){
            $n = $(this);
            $tip = $n.children('.tip');
            
            if($n.hasClass('tip') && $tip.length && $n.data('tip') && $n.data('tip').handler && $n.data('tip').handler.origin){
               //remove data
               tmp = $n.data('tip');
               //tmp = $.extend(true, tmp, {'handler': {'origin': null, 'origin_style': null}});
               delete tmp.handler.origin;
               delete tmp.handler.origin_style;
               $n.data('tip', tmp);
               
               //remove style of tooltips
               $tip.attr('style', null);
            }
         });
         
         if(!all){
            tmp = true;
            self.instance.$allNodes.each(function(){
               $n = $(this);
               $tip = $n.children('.tip');
               
               if($n.hasClass('tip') && $tip.length && $n.data('tip') && $n.data('tip').handler && $n.data('tip').handler.origin){
                  tmp = false;
                  return false;
               }
            });
            if(tmp)
               all = true;
         }
         
         if(all){
            $(self.instance.win).off('.handlerOrigin_' + self.options.name);
            self.instance.on.handlerOrigin = false;
         }
      }
      
      function optimizeRemove(all){
         var $whichNodes = (all)? self.instance.$allNodes: self.instance.$nodes,
             $n,
             $tip,
             tmp;
         
         if(!$whichNodes)
            return;
         
         $whichNodes.each(function(){
            $n = $(this);
            $tip = $n.children('.tip');
            
            if($n.hasClass('tip') && $tip.length && $n.data('tip') && $n.data('tip').optimize){
               //remove data
               tmp = $n.data('tip');
               //tmp = $.extend(true, tmp, {'optimize': null});
               delete tmp.optimize;
               delete tmp.reset;
               $n.data('tip', tmp);
               
               //re-apply position
               $tip.removeClass('top bottom left right').addClass($n.data('tip').pos);
               
               //remove style of tooltips
               $tip.attr('style', null);
               
               //re-apply style of handlers
               if($n.data('tip').handler && $n.data('tip').handler.tip_style)
                  $tip.children('.handler').attr('style', $n.data('tip').handler.tip_style);
            }
         });
         
         if(!all){
            tmp = true;
            self.instance.$allNodes.each(function(){
               $n = $(this);
               $tip = $n.children('.tip');
               
               if($n.hasClass('tip') && $tip.length && $n.data('tip') && $n.data('tip').optimize){
                  tmp = false;
                  return false;
               }
            });
            if(tmp)
               all = true;
         }
         
         if(all){
            $(self.instance.win).off('.optimize_' + self.options.name);
            $(self.instance.parent).off('.optimize_' + self.options.name);
            self.instance.on.optimize = false;
         }
         
         //revert to 'handlerOrigin()'
         if(self.instance.on.handlerOrigin)
            handlerOrigin({});
      }
      
      function trackMouseRemove(all){
         var $whichNodes = (all)? self.instance.$allNodes: self.instance.$nodes,
             $n,
             $tip,
             tmp;
         
         if(!$whichNodes)
            return;
         
         $whichNodes.each(function(){
            $n = $(this);
            $tip = $n.children('.tip');
            
            if($n.hasClass('tip') && $tip.length && $n.data('tip') && $n.data('tip').trackMouse){
               //detach event handlers from nodes
               $n.off('.trackMouse_' + self.options.name);

               //remove data
               tmp = $n.data('tip');
               //tmp = $.extend(true, tmp, {'trackMouse': null});
               delete tmp.trackMouse;
               $n.data('tip', tmp);
               
               //re-apply visibility
               $tip.addClass('css');
               
               //remove style
               $tip.attr('style', null);
            }
         });
         
         if(!all){
            tmp = true;
            self.instance.$allNodes.each(function(){
               $n = $(this);
               $tip = $n.children('.tip');
               
               if($n.hasClass('tip') && $tip.length && $n.data('tip') && $n.data('tip').trackMouse){
                  tmp = false;
                  return false;
               }
            });
            if(tmp)
               all = true;
         }
         
         if(all)
            self.instance.on.trackMouse = false;
      }
      
      function animationRemove(all){
         var $whichNodes = (all)? self.instance.$allNodes: self.instance.$nodes,
             $n,
             $tip,
             tmp;
         
         if(!$whichNodes)
            return;
            
         $whichNodes.each(function(){
            $n = $(this);
            $tip = $n.children('.tip');
            $tip.removeClass('transitioned animated');
            
            if($n.hasClass('tip') && $tip.length && $n.data('tip') && $n.data('tip').animate){
               //detach event handlers from nodes, re-apply visibility & remove style
               $(this).off('.animation_' + self.options.name).children('.tip').addClass('css').attr('style', null);
               
               //remove data
               tmp = $n.data('tip');
               delete tmp.animateIn;
               delete tmp.animate;
               $n.data('tip', tmp);
            }
         });
         
         if(!all){
            tmp = true;
            self.instance.$allNodes.each(function(){
               $n = $(this);
               $tip = $n.children('.tip');
               
               if($n.hasClass('tip') && $tip.length && $n.data('tip') && $n.data('tip').animate){
                  tmp = false;
                  return false;
               }
            });
            if(tmp)
               all = true;
         }
         
         if(all)
            self.instance.on.animation = false;
      }
   }//,
      
   /*
    * Add all nodes to current
    * ------------------------
    */
   /*addBack: function(){
      this.instance.$nodes = this.instance.$nodes.add(this.instance.$allNodes);
   }*/
});
}(window.g3 = window.g3 || {}, jQuery, window, document));

//interface g3.Tips to jquery:
g3.Tips.library('jquery');

g3.Tips.plugin({
   name: 'addBack',
   /*
    * Add all nodes to current
    * ------------------------
    */
   addBack: function(){
      this.instance.$nodes = this.instance.$nodes.add(this.instance.$allNodes);
   }
});
