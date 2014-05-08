/**********************************Class Error**********************************
 * A custom error class.
 * @module {g3.Error}
 *
 * @version 0.1
 * @author Scripto JS Editor by Centurian Comet.
 * @copyright MIT licence.
 ******************************************************************************/
(function(g3, $, window, document){
g3.Error = g3.Class(Error, {
   constructor: function(message, name, original) {
      g3.Error.Super.call(this);
      this.original = original;
      this.name = name || 'Error.g3';
      this.message = message || 'A g3.Error was thrown!';
      (original)? this.stack = this.original.stack: this.stack = null;
      this.message += '\n---STACK---\n' + this.stack;
  }
});
}(window.g3 = window.g3 || {}, jQuery, window, document));