/*********************************Object Class**********************************
 * A class abstraction that is based on prototypal inheritance.
 * It implements inheritance, static members, class mixins.
 * @module {g3}
 *
 * @function {g3.Class}
 * @public
 * @param {[[Function|Object], [Function|Object], ... ]Object} 
 * The last argument is an object with the following behaviour:
 * - method 'constructor' will become the new class constructor,
 *   everything defined inside the constructor with 'this' will become a public 
 *   member, everything defined with 'var' or 'function' will become a private 
 *   member. The internal functions they become privileged methods
 * - all other functions of this argument will become prototypal methods 
 * - member 'STATIC' is an object whose members will be attached to the 
 *   'constructor' as static members (properties, functions). Should note that 
 *   duplicates from parent (the first argument) are never passed.
 *
 * Use of special static property 'Super': access the parent constructor with
 * 'NewClass.Super.call(this, arg1, arg2, ...)' and every parent's method with
 * 'NewClass.Super.prototype.method.call(this, arg1, arg2, ...)'.
 *
 * The next important argument is the first one as it will become the parent: 
 * - public properties of this one declared with 'this' and prototypal ones are 
 *   inherited to the new object (that's why it should be a function)
 * - all static members of parent are passed to this constructor as static too.
 *
 * All in-between arguments, 2nd to n-1, are borrow their members to the new 
 * object resulting in class or object mixins. Should note that duplicates 
 * between arguments are overwritten, the next one overwrites the previous but, 
 * duplicates with the constructor (the last argument) are never passed.
 * @return {Function} A constructor function.
 *
 * @function {g3.Class.extend}
 * @public
 * @param {Function|Object} 'obj' the object or function that is going to be 
 * extended.
 * @param {Function|Object} 'extension' the object or function whose members 
 * are going to be copied.
 * @param {Boolean|null} 'override' if duplicate members from 'extension' are 
 * allowed to be copied, defaults to 'true'.
 * @param {String|null} 'type' the type of members from 'extension' that are 
 * allowed to be copied. If a string other than 'function' is given then, 
 * nothing is copied. If we want everything to be copied then, don't supply this 
 * argument.
 *
 * @version 0.2
 * @author https://github.com/jiem/my-class
 * @copyright MIT licence.
 *
 * Updates by Scripto JS Editor by Centurian Comet:
 * 1. redefine global namespace as g3
 * 2. correct AMD module code not to overwrite my g3 global object
 * 3. object-to-class mixins are allowed.
*******************************************************************************/
(function($, window, document, undefined){
   // Namespace object
   var g3;
   // Return as AMD module or attach to head object
   if (typeof define !== 'undefined')
      define([], function () {
      g3 = g3 || {};
      return g3;
    });
   else if (typeof window !== 'undefined')
      g3 = window.g3 = window.g3 || {};
   else{
      g3 = g3 || {};
      module.exports = g3;
   }

   g3.Class = function () {
      var len = arguments.length;
      if(len === 0 || (len === 1 && arguments[0] === null))
         return function() {};
      var body = arguments[len - 1],
          SuperClass = len > 1 ? arguments[0] : null,
          implementClasses = len > 2,
          Class,
          SuperClassEmpty,
          i;

      //we expect last object to override 'constructor' otherwise the new is empty!
      if (body.constructor === Object) {
         Class = function() {};
      } else {
         Class = body.constructor;
         delete body.constructor;
      }

      //'Class.Super' is a reserved word for g3.Class!
      if (SuperClass) {
         SuperClassEmpty = function() {};
         SuperClassEmpty.prototype = SuperClass.prototype;
         Class.prototype = new SuperClassEmpty();
         Class.prototype.constructor = Class;
         Class.Super = SuperClass;
         extend(Class, SuperClass, false); //works for static members!
      }

      if (implementClasses)
         for (i = 1; i < len - 1; i++)
            if(typeof arguments[i] === 'object')
               extend(Class.prototype, arguments[i], false, 'function');
            else
               extend(Class.prototype, arguments[i].prototype, false);

      extendClass(Class, body);

      return Class;
   };

   function extendClass(Class, extension, override) {
      //'STATIC' is a reserved word from last argument of g3.Class!
      if (extension.STATIC) {
         extend(Class, extension.STATIC, override); //overwrites previous parent's static members
         delete extension.STATIC;
      }
      extend(Class.prototype, extension, override);
   };
   
   var extend = g3.Class.extend = function (obj, extension, override, type) {
      var prop;
      if (override === false) {
         for (prop in extension)
            if (!(prop in obj))
               if(!type)
                  obj[prop] = extension[prop];
               else if(typeof extension[prop] === type)
                  obj[prop] = extension[prop];
      } else {
         for (prop in extension)
            if(!type)
               obj[prop] = extension[prop];
            else if(typeof extension[prop] === type)
               obj[prop] = extension[prop];
         if (extension.toString !== Object.prototype.toString)
            obj.toString = extension.toString;
      }
   };
}(jQuery, window, document));