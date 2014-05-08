/*********************************CSSOM classes*********************************
 * Normalizes CSSOM objects.
 * @module {g3.css}
 *
 * @version 0.5 Takes the highest number of all containing sub-classes.
 * @author Scripto JS Editor by Centurian Comet.
 * @copyright MIT licence.
 ******************************************************************************/
(function(g3, $, window, document, undefined){
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

g3.css = g3.css || {};
/*****************************Class StyleSheetList******************************
 * Public class 'g3.css.StyleSheetList'.
 * Normalizes Mozila's 'styleSheetList' or MS styleSheets list of all style 
 * sheets.
 * @module {g3.css}
 * @constructor
 * @param {Object} 'win' the window object that defaults to 'window'.
 * @param {Boolean} 'infinite' if true then, pass it to g3.css.StyleSheet 
 * constructor to continue to build objects on imported rules.
 * @return {g3.css.StyleSheetList} Initialization is passed to private function 
 * 'init()'.
 * @function {g3.css.StyleSheetList.getNative}
 * @public
 * @return {Object} Returns the native styleSheet list.
 * @function {g3.css.StyleSheetList.item}
 * @public
 * @param {Number} 'n' an index in the native styleSsheet list.
 * @return {g3.css.StyleSheet} Returns a normalized 'StyleSheet' object built 
 * from a native one found at index 'n'. It is built on demand, not initially.
 * @function {g3.css.StyleSheetList.filter}
 * @public
 * @param {Object} 'obj' a custom object with parameters that define how this
 * list will be filtered. There are some rules to follow: 1) 'href', 'rule' and
 * 'selector' should belong to different filters (not mixed) and 2) 'style',
 * 'link' or 'id' can be mixed freely with all the others.
 * - 'deep': if true, it searches deeper than the first-level embedded or linked 
 *           style sheets,
 * - 'href': filters linked or imported style sheets based on the file name,
 * - 'rule': a string, an array of strings or a regular expression that filters 
 *           the css text of rules (arrays are converted to regular expressions 
 *           connected with 'or'),
 * - 'selector': a string, an array of strings or a regular expression that  
 *           filters the selector part of rules (arrays are converted to regular 
 *           expressions connected with 'or'),
 * - 'declaration': a string, an array of strings or a regular expression that 
 *           filters the declaration text of rules (arrays are converted to 
 *           regular expressions connected with 'or'),
 * - 'wordPart': if true, it filters rules based on the given key values of 
 *           'rule', 'selector' or 'declaration' considering them as sub-strings 
 *           otherwise, it behaves to this key values as sub-strings that do not 
 *           end in any of the following: character, number, dash (-) or 
 *           underscore (_), user can alter these interpretations by defining 
 *           his own static filtering function,
 * - 'style': if true, it searches only the embedded style sheets,
 * - 'link': if true, it searches only the linked style sheets,
 * - 'id':   filters only embedded or linked style sheets with this id.
 * @return {g3.css.StyleSheetList} Returns a new custom g3.css.StyleSheetList
 * object.
 * @function {g3.css.StyleSheetList.deleteRules}
 * @public
 * @return {g3.css.StyleSheetList} It deletes the rules found from the last 
 * filtering operation, it ends filtering and returns the original 
 * StyleSheetList list.
 * @function {g3.css.StyleSheetList.end}
 * @public
 * @return {g3.css.StyleSheetList} It clears the results of a filter and returns 
 * the original StyleSheetList list.
 * @function {g3.css.StyleSheetList.getFilterRules}
 * @public
 * @return {Array} Returns a 2-dimensional array where index i refers to style
 * sheet this.item(i) and the value at this index is another array with values 
 * [val1, val2, ...] that refer to indexes of css rules at this style sheet: 
 * this.item(i).cssRules[val1], etc. If nothing is found the array is empty, [].
 * @function {g3.css.StyleSheetList.copy}
 * @public
 * @return {Object} Returns custom object {length: <Integer>, native_list: 
 * <Array>, custom_list: <Array>, filterRules: <Array>} that is a controlled 
 * deep copy of internal state variables so, user doesn't lose the results when 
 * another filtering operation starts. The result holds true as long as the 
 * initial StyleSheetList does not rebuild.
 * @function {g3.css.StyleSheetList.add}
 * @static
 * @param {Object} 'win' the window object that defaults to 'window'.
 * @param {g3.css.StyleSheetList} 'list' a StyleSheetList object that will be 
 * stored at static property 'g3.css.StyleSheetList.instances' as object: 
 * {'win': win, 'list': list}.
 * @return {Function} Returns the constructor function 'g3.css.StyleSheetList'.
 * It is used internally during construction.
 * @function {g3.css.StyleSheetList.get}
 * @static
 * @param {Object} 'win' the window object that defaults to 'window'.
 * @param {Boolean} 'infinite' a true/not true value that dictates the 
 * construction of the StyleSheetList object in case it will happen.
 * @return {g3.css.StyleSheetList} Returns a custom g3.css.StyleSheetList object
 * stored at static 'g3.css.StyleSheetList.instances' as object: {'win': win, 
 * 'list': list} or creates one, stores it at 'g3.css.StyleSheetList.instances'
 * and returns it.
 * @function {g3.css.StyleSheetList.filter}
 * @static
 * @param {String} 'text' the rule text to search for.
 * @param {String|Array|RegExp} 'selectors' a string or array of strings or a 
 * regular expression that represent different tokens to search for into the 
 * 'text' argument .
 * @param {Boolean} 'wordPart' a a true/not true value of how the search will 
 * happen. When wordPart !== true, it considers css words as strings that end to
 * anything else except letters, numbers, dash (-) or underscore (_). So, when 
 * wordPart !== true, a search for 'data' inside text '.left[data-tip]:after' 
 * will fail, a search for 'data-tip' will succeed, a search for 'lef' will fail 
 * but a search for 'eft' or '.left' will succeed. User can overwrite this 
 * function.
 * @return {Boolean} Returns true when we want to add a rule at the results of 
 * public instance method 'filter()' otherwise, it should return false. It is
 * used internally by instance method 'filter()' when the argument has keys 
 * 'rule', 'selector' or 'declaration'.
 *
 * @version 0.5
 * @author Scripto JS Editor by Centurian Comet.
 * @copyright MIT licence.
 * @reference
 * http://msdn.microsoft.com/en-us/library/ie/ms531200%28v=vs.85%29.aspx
 * https://developer.mozilla.org/en-US/docs/Web/API/Document.styleSheets
 ******************************************************************************/
g3.css.StyleSheetList = g3.Class({
   constructor: function(win, infinite){
      /* 
       * MVC initial state
       * -----------------
       * the initial data state diagram
      */
      var self = this;
      var initial = {
         length: null,
         native_list: null,
         custom_list: null
         //include 'win', 'infinite' arguments
      };
      /*
       * MVC transient state
       * -------------------
       * the transient data state diagram
       */
      var state = {
         filtered: null,
         length: null,
         native_list: null,
         custom_list: null,
         filterRules: null
      };
      
      //private function: initialization
      //builds argument 'win', public property 'length' and 'global' private variable 'initial'
      function init(self, win, infinite){
         var tmp;
         initial.custom_list = [];
         if(win && (win.self === win) && (win.window === win))
            tmp = win.document.styleSheets;
         else{
            tmp = window.document.styleSheets;
            win = window;
         }
         if(tmp){
            initial.native_list = [];
            for(var i=0; i < tmp.length; i++)
               initial.native_list[i] = tmp[i];
         }
         self.length = initial.length = (initial.native_list && initial.native_list.length)? initial.native_list.length: null;
         //if we wouldn't care for deferred 'init()' then, private function 'build()' should be here!
         return self;
      };
      
      //private function: a deferred 'init()' helping filtering
      //builds 'global' private variable 'initial.custom_list' and argument 'infinite' only once
      function build(deep){
         if(deep && !infinite){
            infinite = true;
            for(var i=0; i < initial.native_list.length; i++)
               initial.custom_list[i] = new g3.css.StyleSheet(initial.native_list[i], infinite);
         }else
            for(var i=0; i < initial.native_list.length; i++)
               if(!initial.custom_list[i])
                  initial.custom_list[i] = new g3.css.StyleSheet(initial.native_list[i], infinite);
      }
      
      //public instance privileged method
      this.getNative = function(){
         if(state.filtered)
            return state.native_list;
         else
            return initial.native_list;
      };
      
      //public instance privileged method: a deferred 'init()'
      //builds 'global' private variable 'initial.custom_list' on demand when no filtering!
      //there is a penalty here: if we care for deep filters but 'infinite'  
      //wasn't given as true then everything will be rebuilt (only once)!
      this.item = function(n){
         if(state.filtered){
            if((state.length) && (n < state.custom_list.length) && (n >= 0))
                  return state.custom_list[n];
            return null;
         }else{
            if((initial.length) && (n < initial.native_list.length) && (n >= 0)){
               //Attention: length of sparse arrays reports the same as if they were full!
               //test: request StyleSheetList.item(1) and then StyleSheetList.item(0)
               if(initial.custom_list[n])
                  return initial.custom_list[n];
               else
                  return initial.custom_list[n] = new g3.css.StyleSheet(self.getNative()[n], infinite);
            }else
               return null;
         }
      };
      
      //private function: recursively search for href in style sheet rules type of imported
      //recursion happens only on first filter: after that arrays represent the flattened tree!
      function styleSheetHref(custom_list, native_list, custom_sheet, href){
         try{
            for(var i=0; i < custom_sheet.cssRules.length; i++){
               if(custom_sheet.cssRules[i].getTypeName() === 'IMPORT_RULE'){
                  if(custom_sheet.cssRules[i].cssText.indexOf(href) > -1){
                     custom_list.push(custom_sheet.cssRules[i].styleSheet);
                     native_list.push(custom_sheet.cssRules[i].styleSheet.getNative());
                  }else
                     styleSheetHref(custom_list, native_list, custom_sheet.cssRules[i].styleSheet, href);
               }
            }
         }catch(e){
            //alert('Failed to recursively search for href in imported rules: ' + e);
            throw new g3.Error('Failed to recursively search for href \'' + href + '\' in imported rules.', 'Error.css.g3', e);
         }
      }
      
      //private function: (recursively) search for a text pattern in style sheet rules -> imported style sheet rules
      //recursion happens only on first filter: after that arrays represent the flattened tree!
      function styleSheetRules(custom_list, native_list, rules, custom_sheet, initial_rules, where, str, deep, wordPart){
         try{
            var text, tmp = [];
            //recursion only on first filter as the result is a flattened tree!
            if(!state.filtered && deep)
               for(var i=0; i < custom_sheet.cssRules.length; i++)
                  //if(custom_sheet.cssRules[i].getTypeName() !== 'STYLE_RULE')
                  if((custom_sheet.cssRules[i].getTypeName() !== 'STYLE_RULE') && (custom_sheet.cssRules[i].styleSheet))
                     styleSheetRules(custom_list, native_list, rules, custom_sheet.cssRules[i].styleSheet, initial_rules, where, str, deep, wordPart);
            //no previous filtering in rules has been done: push rules!
            if(initial_rules.length === 0){
               for(var i=0; i < custom_sheet.cssRules.length; i++){
                  if(where === 'rule')
                     text = custom_sheet.cssRules[i].cssText;
                  else if(where === 'selector')
                     text = custom_sheet.cssRules[i].selector;
                  else if(where === 'declaration')
                     text = custom_sheet.cssRules[i].declaration;
                  else
                     return;

                  if((custom_sheet.cssRules[i].getTypeName() === 'STYLE_RULE') && (g3.css.StyleSheetList.filter(text, str, wordPart))){
                  //if((custom_sheet.cssRules[i].getTypeName() === 'STYLE_RULE') && (text.search(str) > -1))
                     tmp.push(i); //index of custom rule
                  }
               }
            //previous filtering has been done: restrict search!
            }else{
               for(var i=0; i < initial_rules.length; i++){
                  if(where === 'rule')
                     text = custom_sheet.cssRules[initial_rules[i]].cssText;
                  else if(where === 'selector')
                     text = custom_sheet.cssRules[initial_rules[i]].selector;
                  else if(where === 'declaration')
                     text = custom_sheet.cssRules[initial_rules[i]].declaration;
                  else
                     return;
                  if((custom_sheet.cssRules[initial_rules[i]].getTypeName() === 'STYLE_RULE') && (g3.css.StyleSheetList.filter(text, str, wordPart))){
                  //if((custom_sheet.cssRules[i].getTypeName() === 'STYLE_RULE') && (text.search(str) > -1))
                     tmp.push(initial_rules[i]); //index of custom rule
                  }
               }
            }
            if(tmp.length){
               custom_list.push(custom_sheet);
               native_list.push(custom_sheet.getNative());
               rules.push(tmp);
            }
         }catch(e){
            //alert('Failed to recursively search for a rule pattern in imported rules: ' + e);
            throw new g3.Error('Failed to recursively search for the rule pattern \'' + str + '\' at \'' + where + '\' in imported rules.', 'Error.css.g3', e);
         }
      }
      
      //public instance privileged method
      //builds or filters more on 'global' private variable 'state'
      //(successive) filters end with method 'end()'
      this.filter = function(arg){
         if(!arg || (g3.utils.type(arg) !== 'object') || !self.length)
            return self;
         
         //a deferred 'init()': 
         //builds 'global' private variable 'initial.custom_list' and argument 'infinite' only once
         if(!state.filtered)
            build(arg['deep']);
         else
            //on chaining we can't change depth of search!
            arg['deep'] = infinite;
         
         //make filters chainable!
         //copy previous 'global' private variable 'state' or 'initial' to a local one
         var _initial = self.copy();
         
         //(re)create 'global' private variable 'state': our end results!
         state.custom_list = [];
         state.native_list = [];
         state.filterRules = [];
         
         //search: href (linked and imported) or linked
         if(arg['href']){
            var tmp;
            for(var i=0; i < _initial.custom_list.length; i++){
               if(
                  (_initial.custom_list[i].getTypeName() === 'LINKED_SHEET') && 
                  (_initial.custom_list[i].ownerNode.href.indexOf(arg['href']) > -1) &&
                  (!arg['id'] || (_initial.custom_list[i].ownerNode.id === arg['id']))
               ){
                  state.custom_list.push(_initial.custom_list[i]);
                  state.native_list.push(_initial.custom_list[i].getNative());
                  if((state.filtered) && (_initial.filterRules.length > 0)){
                     tmp = [];
                     for(var j=0; j < _initial.filterRules[i].length; j++)
                        tmp.push(_initial.filterRules[i][j]);
                     state.filterRules.push(tmp);
                  }
               }else if(arg['deep'] && !arg['id'] && !arg['link'] && !arg['style'] && !state.filtered)
                  styleSheetHref(state.custom_list, state.native_list, _initial.custom_list[i], arg['href']);
            }
         //search all the rule (css text) or just the selector
         }else if(arg['rule'] || arg['selector'] || arg['declaration']){
            var where,
                str;
            if(arg['rule']){
               where = 'rule';
               str = arg['rule'];
            }else if(arg['selector']){
               where = 'selector';
               str = arg['selector'];
            }else{
               where = 'declaration';
               str = arg['declaration'];
            }
            for(var i=0; i < _initial.custom_list.length; i++)
               if((arg['id'] && (_initial.custom_list[i].ownerNode.id === arg['id'])) ||
                  (!arg['id'] &&
                     (  (!arg['style'] && !arg['link']) || 
                        (arg['style'] && _initial.custom_list[i].getTypeName() === 'STYLE_SHEET') || 
                        (arg['link'] && _initial.custom_list[i].getTypeName() === 'LINKED_SHEET')
                     )
                  )
               )
                  if(_initial.filterRules.length > 0)
                     styleSheetRules(state.custom_list, state.native_list, state.filterRules, _initial.custom_list[i], _initial.filterRules[i], where, str, arg['deep'], arg['wordPart']);
                  else
                     styleSheetRules(state.custom_list, state.native_list, state.filterRules, _initial.custom_list[i], [], where, str, arg['deep'], arg['wordPart']);
         //search linked, embedded style sheets
         }else if(arg['link'] || arg['style'] || arg['id']){
            var tmp;
            for(var i=0; i < _initial.custom_list.length; i++){
               if(
                  (arg['style'] && (_initial.custom_list[i].getTypeName() === 'STYLE_SHEET')) || 
                  (arg['link'] && (_initial.custom_list[i].getTypeName() === 'LINKED_SHEET')) || 
                  (arg['id'] && (_initial.custom_list[i].ownerNode.id === arg['id']))
               ){
                  state.custom_list.push(_initial.custom_list[i]);
                  state.native_list.push(_initial.custom_list[i].getNative());
                  if((state.filtered) && (_initial.filterRules.length > 0)){
                     tmp = [];
                     for(var j=0; j < _initial.filterRules[i].length; j++)
                        tmp.push(_initial.filterRules[i][j]);
                     state.filterRules.push(tmp);
                  }
               }
            }
         }

         //2nd and next filters won't use 'build()' again nor they'll search recursively
         if(!state.filtered)
            state.filtered = true;
         
         self.length = state.length = (state.native_list.length)? state.native_list.length: null;
         return self;
      };
      
      //public instance privileged method
      //deletes the rules found in last filtering operation
      this.deleteRules = function(arg){
         if(state.filtered && self.length && state.filterRules.length){
            var ndx;
            for(var i = 0; i < state.length; i++){
               ndx = 0;
               for(var j = 0; j < state.filterRules[i].length; j++){
                  state.custom_list[i].deleteRule(state.filterRules[i][j] - ndx);
                  ++ndx;
               }
            }
         }
         return this.end();
      };
      
      //public instance privileged method
      this.getFilterRules = function(){
         return state.filterRules;
      };
      
      //public instance privileged method
      this.end = function(){
         state.filtered = false;
         state.length = null;
         state.native_list = null;
         state.custom_list = null;
         state.filterRules = null;
         self.length = initial.length;
         return self;
      };
      
      //public instance privileged method
      //copy arrays but not custom or native objects: a controlled deep copy!
      this.copy = function(){
         var res = {
            length: null,
            native_list: [],
            custom_list: [],
            filterRules: []
         },
         tmp;
         if(state.filtered){
            res.length = state.length;
            for(var i=0; i < state.native_list.length; i++)
               res.native_list[i] = state.native_list[i];
            for(var i=0; i < state.custom_list.length; i++)
               res.custom_list[i] = state.custom_list[i];
            for(var i=0; i < state.filterRules.length; i++){
               tmp = [];
               for(var j=0; j < state.filterRules[i].length; j++)
                  tmp.push(state.filterRules[i][j]);
               res.filterRules.push(tmp);
            }
         }else{
            res.length = initial.length;
            for(var i=0; i < initial.native_list.length; i++)
               res.native_list[i] = initial.native_list[i];
            for(var i=0; i < initial.custom_list.length; i++)
               res.custom_list[i] = initial.custom_list[i];
         }
         return res;
      };
      
      //initialize object once!
      init(this, win, infinite);
      //store object in class's static list
      g3.css.StyleSheetList.add(win, this);
   },
   STATIC: {
      instances: [],
      //if none is found, it creates one!
      get: function(win, infinite){
         for(var i = 0; i < g3.css.StyleSheetList.instances.length; i++)
            if(g3.css.StyleSheetList.instances[i]['win'] === win)
               return g3.css.StyleSheetList.instances[i]['list'];
         return new g3.css.StyleSheetList(win, infinite);
      },
      add: function(win, list){
         //care for overlaps
         for(var i = 0; i < g3.css.StyleSheetList.instances.length; i++)
            if(g3.css.StyleSheetList.instances[i]['win'] === win){
                  g3.css.StyleSheetList.instances.splice(i, 1, {'win': win, 'list': list});
                  return this;
            }
         g3.css.StyleSheetList.instances.push({'win': win, 'list': list});
         return this;
      },
      //searches a string 'text' for any of patterns 'selectors' given as a string or as an array of strings
      filter: function(text, selectors, wordPart){
         if(!text)
            return false;
         if(g3.utils.type(selectors) === 'regexp')
            return (text.search(selectors) > -1);
         else if(g3.utils.type(selectors) === 'string')
            selectors = [selectors];
         else if(g3.utils.type(selectors) !== 'array')
            return false;
         var tmp, reg = '';
         //escape characters with special meaning in RegExp: double escape when new RegExp(string)
         for(var i = 0; i < selectors.length; i++){
            tmp = selectors[i].replace(/\./g, '\\.');
            tmp = tmp.replace(/\+/g, '\\+');
            tmp = tmp.replace(/\-/g, '\\-');
            tmp = tmp.replace(/\[/g, '\\[');
            tmp = tmp.replace(/\]/g, '\\]');
            tmp = tmp.replace(/\~/g, '\\~');
            tmp = tmp.replace(/\^=/g, '\\^=');
            tmp = tmp.replace(/\~=/g, '\\~=');
            tmp = tmp.replace(/\|=/g, '\\|=');
            tmp = tmp.replace(/\$=/g, '\\$=');
            tmp = tmp.replace(/\*=/g, '\\*=');
            //accept chainable selectors, e.g.: .tip.animated:after
            if(!wordPart)
               tmp += '[^A-Za-z_\\-0-9]*';
            reg += tmp + '|';
         }
         reg = reg.slice(0, -1);
         reg = new RegExp(reg);
         return (text.search(reg) > -1);
      }
   }
});

/*******************************Class StyleSheet********************************
 * Public class 'g3.css.StyleSheet'.
 * Normalizes Mozila's or MS 'styleSheet' object that represents a single style 
 * sheet.
 * @module {g3.css}
 * @constructor
 * @param {styleSheet} 'style' a native styleSheet object.
 * @param {Boolean} 'infinite' if true then, pass it to g3.css.Rule constructor 
 * to continue to build objects on imported rules.
 * @return {} None because we use a class library. Initialization is passed to
 * method 'init()'.
 * @function {g3.css.StyleSheet.getNative}
 * @public
 * @return {Object} Returns the native styleSheet object.
 * @function {g3.css.StyleSheet.set}
 * @public
 * @param {String} 'prop' a style sheet property to be set if accessors cannot 
 * be defined.
 * @param {String} 'value' a value of the property that is set.
 * @return {} None.
 * @function {g3.css.StyleSheet.deleteRule}
 * @public
 * @param {Number} 'ndx' the index where the new rule is added.
 * @return {Boolean} False if 'ndx' is off range [0, this.length-1] or an empty
 * style argument during construction or an internal failure to delete and 
 * update length. In last case trust the updated property 'this.cssText'.
 * @function {g3.css.StyleSheet.insertRule}
 * @public
 * @param {String} 'rule' a new rule to add.
 * @param {Number} 'ndx' the index where the new rule is added.
 * @return {Boolean} False if 'ndx' is off range [0, this.length] or an empty
 * style argument during construction or an internal failure to insert and 
 * update length. In last case trust the updated property 'this.cssText'.
 * @function {g3.css.StyleSheet.replaceRule}
 * @public
 * @param {String} 'rule' a new rule that replaces the old one at index 'ndx'.
 * @param {Number} 'ndx' the index where the new rule replaces the old one.
 * @return {Boolean} False if 'ndx' is off range [0, this.length] or an empty
 * style argument during construction or an internal failure to delete, insert 
 * and update length. In last case do not trust property 'this.cssText'.
 * @function {g3.css.StyleSheet.getTypeName}
 * @public
 * @return {String} A descriptive string of the propery 'this._type' as in 
 * g3.css.Rule.
 * 
 * @version 0.2
 * @author Scripto JS Editor by Centurian Comet.
 * @copyright MIT licence.
 * @reference
 * http://msdn.microsoft.com/en-us/library/ie/ms535871%28v=vs.85%29.aspx
 * http://msdn.microsoft.com/en-us/library/dd229916%28v=VS.85%29.aspx
 * http://msdn.microsoft.com/en-us/library/ie/ff800817%28v=vs.94%29.aspx
 * http://msdn.microsoft.com/en-us/library/ie/jj127351%28v=vs.85%29.aspx
 * https://developer.mozilla.org/en-US/docs/Web/API/StyleSheet
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
 * http://help.dottoro.com/ljqlhiwa.php#cssRules
 * http://davidwalsh.name/add-rules-stylesheets
 ******************************************************************************/
g3.css.StyleSheet = g3.Class({
   constructor: function(style, infinite){
      this.init(this, style, infinite);
   },
   init: function(self, style, infinite){
      self.infinite = infinite;
      //public instance privileged method
      self.getNative = function(){
         return style;
      };
      if(style){
         //all browsers, read
         if(style.ownerNode)
            self.ownerNode = style.ownerNode;
         else if(style.owningElement)
            self.ownerNode = style.owningElement;
         else
            self.ownerNode = null;
         //all browsers, read
         if(style.ownerRule)
            self.ownerRule = style.ownerRule;
         else
            self.ownerRule = null;
          //all browsers, read
         if(style.type)
            self.type = style.type;
         else
            self.type = null;
         //a custom type as in rules because native 'type' reports 'text/css'
         self._type = 0;
         if(self.ownerRule)
            self._type = 3;
         else if(self.ownerNode && (self.ownerNode.nodeName.toUpperCase() === 'LINK'))
            self._type = 2;
         else if(self.ownerNode && (self.ownerNode.nodeName.toUpperCase() === 'STYLE'))
            self._type = 1;
         //IE, read, write
         if(style.cssText)
            self.cssText = style.cssText;
         else
            self.cssText = null;
      }else{
         self.ownerNode = null;
         self.ownerRule = null;
         self.type = null;
         self._type = null;
         self.cssText = null;
      }
      //ATTENTION: circular reference when used!
      //self.parentStyleSheet = ((style && style.parentStyleSheet)? new g3.css.StyleSheet(style.parentStyleSheet): null); //read
      //emulate native: cssRules and length properties
      self.cssRules = [];
      self.length = 0;
      if(style){
         //FF & compatible
         if(style.cssRules){
            self.length = style.cssRules.length;
            for(i = 0; i < self.length; i++)
               if(typeof style.cssRules[i] === 'object')
                  self.cssRules.push(new g3.css.Rule(style.cssRules[i], null, infinite));
         //IE
         }else if(style.rules){
            self.length = style.rules.length;
            for(var i = 0; i < self.length; i++)
               if(typeof style.rules[i] === 'object')
                  self.cssRules.push(new g3.css.Rule(style.rules[i], {'style_rule': {'type': 1}}, infinite));
         }
         //FF & compatible
         if(!self.cssText){
            self.cssText = '';
            for(var i = 0; i < self.length; i++){
               self.cssText += self.cssRules[i].cssText + '\n';
            }
         }
         //handle IE madness: self.cssText contains imported rules but they 
         //don't exist in self.cssRules above! We need a custom rule object!
         if(style.imports && (style.imports.length > 0)){
            //extract @import rules
            //or, self.cssText.match(/@import.*[^;];/gi);
            var imports = self.cssText.match(/@import(?:[^;])*;/gi);
            self.disposition = imports.length;
            if(imports){
               for(var i = 0; i < imports.length; i++)
                  self.cssRules.unshift(new g3.css.Rule({}, {'import_rule': {'cssText': imports[i], 'type': 3, 'styleSheet': style.imports[i]}}, infinite));
               self.length = self.cssRules.length;
            }
         }else
            self.disposition = 0;
      }
      try{
         //accessor properties: setters & getters
         Object.defineProperties(self, {
            disabled: {
               get: function(){ //read
                  return ((style)? style.disabled: null);
               },
               set: function(x){ //write
                  style.disabled = x;
               },
               configurable: true,
               enumerable: true
            },
            href: {
               get: function(){
                  return ((style)? style.href: null);
               },
               set: function(x){ //write in IE
                  style.href = x;
               },
               configurable: true,
               enumerable: true
            },
            media: {
               get: function(){
                  var tmp = ((style)? style.media: null);
                  if(typeof tmp === 'object')
                     return tmp.mediaText;
                  else
                     return tmp;
               },
               set: function(x){ //write
                  if(typeof style.media === 'object')
                     style.media.mediaText = x;
                  else
                     style.media = x;
               },
               configurable: true,
               enumerable: true
            },
            title: {
               get: function(){
                  return ((style)? style.title: null);
               },
               set: function(x){ //write in IE
                  style.title = x;
               },
               configurable: true,
               enumerable: true
            }
         });
      }catch(e){
         self.disabled = ((style)? style.disabled: null); //read-write
         self.href = ((style)? style.href: null); //write in IE
         self.media = ((style)? style.media: null); //write in IE
         if(self.media && typeof self.media === 'object')
            self.media = style.media.mediaText;
         self.title = ((style)? style.title: null); //write in IE
      };
      return self;
   },
   //define a 'set()' function if 'Object.defineProperties' fails
   set: function(prop, value){
      this[prop] = this.getNative()[prop] = value;
   },
   deleteRule: function(ndx){
      var style = this.getNative(),
          result = false;
      if(!style || (typeof ndx !== 'number') || (ndx >= this.length) || (ndx < 0))
         return result;
      ndx -= this.disposition;
      try{
         if(style.deleteRule){
            style.deleteRule(ndx);
            result = true;
         }else if(style.removeRule){
            style.removeRule(ndx);
            result = true;
         }
      }catch(e){
         //alert('Failed to delete rule: ' + e);
         throw new g3.Error('Failed to delete rule at index ' + ndx + '.', 'Error.css.g3', e);
      }
      if(result){
         --this.length;
         this.cssRules.splice(ndx + this.disposition, 1);
         //IE
         this.cssText = style.cssText;
         //FF & compatible
         if(!this.cssText){
            this.cssText = '';
            for(var i = 0; i < this.length; i++){
               this.cssText += this.cssRules[i].cssText + '\n';
            }
         }
      }
      return result;
   },
   insertRule: function(rule, ndx){
      var style = this.getNative(),
          result = false;
      if(!style || (typeof rule !== 'string') || (typeof ndx !== 'number') || (ndx > this.length) || (ndx < 0))
         return false;
      ndx -= this.disposition;
      try{
         if(style.insertRule){
            style.insertRule(rule, ndx);
            result = true;
         }else if(style.addRule){
            var selector, declaration;
            selector = rule.slice(0, rule.indexOf('{'));
            declaration = rule.slice(rule.indexOf('{')+1, rule.lastIndexOf('}'));
            style.addRule(selector, declaration, ndx);
            result = true;
         }
      }catch(e){
         //alert('Failed to insert rule: ' + e);
         throw new g3.Error('Failed to insert rule \'' + rule + '\' at index ' + ndx + '.', 'Error.css.g3', e);
      }
      if(result){
         this.init(this, this.getNative(), this.infinite);
         /*
         //FF & compatible
         if(style.cssRules)
            this.cssRules.splice(ndx + this.disposition, 0, new g3.css.Rule(style.cssRules[ndx], null, this.infinite));
         //IE
         else if(style.rules)
            this.cssRules.splice(ndx + this.disposition, 0, new g3.css.Rule(style.rules[ndx], {'style_rule': {'type': 1}}, this.infinite));
         else
            result = false;
         if(result){
            ++this.length;
            //IE
            this.cssText = style.cssText;
            //FF & compatible
            if(!this.cssText){
               this.cssText = '';
               for(var i = 0; i < this.length; i++){
                  this.cssText += this.cssRules[i].cssText + '\n';
               }
            }
         }
         */
      }
      return result;
   },
   replaceRule: function(rule, ndx){
      return (this.deleteRule(ndx) && this.insertRule(rule, ndx));
   },
   STATIC: {
      type: {
         0: 'UNKNOWN_SHEET',
         1: 'STYLE_SHEET',
         2: 'LINKED_SHEET',
         3: 'IMPORTED_SHEET'
      }
   },
   getTypeName: function(){
      return g3.css.StyleSheet.type[this._type];
   }
});

/**********************************Class Rule***********************************
 * Public class 'g3.css.Rule'.
 * Normalizes Mozila's or MS 'Rule' object that represents a single style 
 * rule.
 * @module {g3.css}
 * @constructor
 * @param {Rule} 'rule' a native style rule object.
 * @param {Object} 'obj' a custom helper object used by class g3.css.StyleSheet
 * during initialization.
 * @param {Boolean} 'infinite' if true then, continue to build objects on 
 * imported rules.
 * @return {} None because we use a class library. Initialization is passed to
 * method 'init()'.
 * @function {g3.css.Rule.getNative}
 * @public
 * @return {Object} Returns the native style rule object.
 * @function {g3.css.Rule.getTypeName}
 * @public
 * @return {String} A descriptive string of the propery 'this.type'.
 * 
 * @version 0.1
 * @author Scripto JS Editor by Centurian Comet.
 * @copyright MIT licence.
 * @reference
 * https://developer.mozilla.org/en-US/docs/Web/API/CSSRule?redirectlocale=en-US&redirectslug=DOM%2FcssRule
 * https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleRule
 * https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Using_dynamic_styling_information?redirectlocale=en-US&redirectslug=Web%2FGuide%2FDOM%2FUsing_dynamic_styling_information
 * https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule?redirectlocale=en-US&redirectslug=CSS%2FAt-rule
 * http://msdn.microsoft.com/en-us/library/ie/ff975067%28v=vs.85%29.aspx
 * http://msdn.microsoft.com/en-us/library/ie/ms535887%28v=vs.85%29.aspx
 * http://msdn.microsoft.com/en-us/library/aa358815%28v=vs.85%29.aspx
 * http://help.dottoro.com/ljdxvksd.php
 ******************************************************************************/
g3.css.Rule = g3.Class({
   constructor: function(rule, obj, infinite){
      function init(self, rule, obj, infinite){
         //public instance privileged method
         self.getNative = function(){
            //IE for @import only
            if(obj && obj.import_rule)
               return obj.import_rule.styleSheet;
            //FF & compatible for @import only
            else if(rule && rule.styleSheet)
               return rule.styleSheet;
            //all browsers except for @import
            else
               return rule;
         };
         //going infinite deeper!
         self.styleSheet = null;
         if(infinite === true)
            self.styleSheet = new g3.css.StyleSheet(self.getNative(), infinite);
         if(rule){
            //FF & compatible, read
            if(rule.cssText)
               self.cssText = rule.cssText;
            //IE, read, write
            else if(rule.style)
               self.cssText = rule.selectorText + ' { ' + rule.style.cssText + ' }';
            //IE for @import only
            else if(obj && obj.import_rule)
               self.cssText = obj.import_rule.cssText;
            else
               self.cssText = null;
            //all browsers, read
            if(rule.selectorText)
               self.selector = rule.selectorText;
            else
               self.selector = self.cssText.slice(0, self.cssText.indexOf('{'));
            //all browsers, read
            if(rule.style)
               self.declaration = rule.style.cssText;
            else
               self.declaration = self.cssText.slice(self.cssText.indexOf('{')+1, self.cssText.lastIndexOf('}'));
            //FF & compatible, read
            if(rule.type)
               self.type = rule.type;
            //IE for @import only
            else if(obj && obj.import_rule)
               self.type = obj.import_rule.type;
            //IE for style rule only
            else if(obj && obj.style_rule)
               self.type = obj.style_rule.type;
            else
               self.type = null;
            //drop declaration for import rules
            if(self.type === 3)
               self.declaration = null;
            //FF & compatible for @import only, read
            if(rule.href)
               self.href = rule.href;
            //IE for @import only
            else if(obj && obj.import_rule && obj.import_rule.styleSheet)
               self.href = obj.import_rule.styleSheet.href;
            else
               self.href = null;
            //FF & compatible for @import only, read
            if(rule.media)
               self.media = rule.media.mediaText;
            //IE for @import only
            else if(obj && obj.import_rule && obj.import_rule.styleSheet)
               self.media = obj.import_rule.styleSheet.media;
            else
               self.media = null;
         }else{
            self.cssText = null;
            self.selector = null;
            self.declaration = null;
            self.type = null;
            self.href = null;
            self.media = null;
         }
         //ATTENTION: circular reference when used!
         //self.parentRule = ((rule && rule.parentRule)? new g3.css.Rule(rule.parentRule): null); //read
         //ATTENTION: circular reference when used!
         //self.parentStyleSheet = ((rule && rule.parentStyleSheet)? new g3.css.StyleSheet(rule.parentStyleSheet): null); //read
         return self;
      }
      init(this, rule, obj, infinite);
   },
   STATIC: {
      type: {
         0: 'UNKNOWN_RULE',
         1: 'STYLE_RULE',
         2: 'CHARSET_RULE',
         3: 'IMPORT_RULE',
         4: 'MEDIA_RULE',
         5: 'FONT_FACE_RULE',
         6: 'PAGE_RULE',
         7: 'NAMESPACE_RULE'
      }
   },
   getTypeName: function(){
      return g3.css.Rule.type[this.type];
   }
});
}(window.g3 = window.g3 || {}, jQuery, window, document));