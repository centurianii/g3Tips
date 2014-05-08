g3Tips
======
<p>A tooltip class for web pages. It behaves nicely with or without javascript. It is flex- and respond-awared, it can use a subset of presented styles and can be enhanced with numerous new css3 effects.</p>
<h2>Table of contents</h2>
<ol>
<li>Construction
<ol>
<li>Autonomous object</li>
<li>Through JQuery</li>
<li>JQuery jump in & out</li>
<li>What <code>init()</code> does?</li>
<li>where is it? Destroy it!</li>
</ol>
</li>

<li>Operate
<ol>
<li>Convert</li>
<li>Tooltip handlers</li>
<li>Tooltip origin</li>
<li>Tooltip optimize</li>
<li>Tooltip position</li>
<li>Handler display</li>
</ol>
</li>
</ol>

<h2>1. Construction</h2>
<h3>1.i Autonomous object</h3>
<p>Let's create an object:</p>
<pre>
//class constructor

var framewin = $('#stub iframe').get(0).contentWindow;
var debug = {};

var tips = new g3.Tips({parent: framewin.document, 'debug': debug});

console.log('-----g3.Tips object-----');
console.log(tips);

console.log('-----internal function run-----');
console.log(debug);
</pre>
<p>Output:</p>
<pre>
-----g3.Tips object-----

    [0] options -> 'object'[object Object]
    [0] libraries -> []
    [0] instance -> 'object'[object Object]
    [0] addLibrary -> 'function' [function (name, lib){...]
    [0] to -> 'function' [function (name){...]
    [0] end -> 'function' [function (name){...]
    [0] init -> 'function' [function (options){...]

-----internal function run-----

    [0] getStyles -> 'true'
    [0] getNodes -> 'false'
    [0] convert -> 'false'
    [0] applyTitle -> 'false'
    [0] applyPosition -> 'false'
    [0] applyHandlerTip -> 'false'
    [0] applyHandlerOrigin -> 'false'
    [0] applyDisplayHandler -> 'false'
    [0] applyOptimize -> 'false'
    [0] applyAnimation -> 'false'
    [0] applyEvents -> 'false'
</pre>
<p>As you can see the object contains 3 objects as members and 4 functions. From the perspective of user only <code>this.instance.$allNodes</code>, <code>this.instance.$nodes</code> and <code>this.init()</code> are really usable. So, there is no function-to-user interface which is brilliant! Everything is controlled from options, our <i>switchboard</i>.</p>
<p>That was an empty object though.</p>

<h3>1.ii Through JQuery</h3>
<p>Let's use JQuery to build an object:</p>
<pre>
//jquery plugin constructor:
//builds g3.Tips objects and fills their nodes

var framewin = $('#stub iframe').get(0).contentWindow;
var debug = {};

$('.tip > .tip', framewin.document).parent('.tip').g3Tips({name: 'test', parent: framewin.document, 'debug': debug});

console.log('Nodes collected: ' + g3.Tips.get('test').instance.$nodes.length);
console.log('Total nodes collected: ' + g3.Tips.get('test').instance.$allNodes.length);
console.log('-----g3.Tips.instance------');
console.log(g3.Tips.get('test').instance);
</pre>
<p>Output:</p>
<pre>
Nodes collected: 20
Total nodes collected: 20
-----g3.Tips.instance------

   1. [0] name -> 'test'
   2. [0] parent -> 'object'[object HTMLDocument]
   3. [0] win -> 'object'[object Window]
   4. [0] firstBuilt -> 'true'
   5. [0] css -> 'object'[object Object]
   6. [0] handler -> 'object'[object Object]
   7. [0] on -> 'object'[object Object]
   8. [0] $nodes -> 'object'[object Object]
   9. [0] $allNodes -> 'object'[object Object]
</pre>
<p>As you can see <code>this.instance</code> contains pretty much everything we'll ever need to look for.</p>
<p>The initial idea was that simple: <i>"one set of nodes is handled by one object g3.Tips"</i> and in that situation <code>this.instance.$nodes</code> would be enough. Going one step further I decided to satisfy this demand: <i>"I want to chain commands and every one can work with a different set"</i>. This is possible too, keep reading on <i>1.iii></i>!</p>
<small style="border: 2px gray dotted"><i>Development issues:</i> Even in the situation of chaining commands, <code>this.instance.$nodes</code> is still enough as it is refilled by your new collection every time. Do you need  memory for your sets? Just forget it! Actually you don't need memory, (re-)collect a new set drop it in and apply whatever you want using options object <i>(switchboard)</i>.</small>
<p>The next step was to satisfy an optimized request: <i>"I want my tooltips to be repositioned when the visible area is scrolling"</i>. You have it!</p>
<small style="border: 2px gray dotted"><p><i>Development issues:</i> That one, brought events in play that operate <b>after</b> the firing of all methods and now we do need a memory variable <code>this.instance.$allNodes</code> to operate upon!</p>
<p>This is not the end of the story though, every node in our collection stores data about it's last condition so optimization mess up could be reverted. Just fine!</small>

<h3>1.iii JQuery jump in & out</h3>
<p>JQuery can jump into our class, fill in the temporary node storage, jump out, collect a new set, jump in and start all over again a new circle of operations:
<pre>
$(...).g3Tips('test').
init(...).init(...).to('jquery').
add(...).find(...).filter()...g3Tips('test').
init(...)...
...
</pre>
</p>
<pre>
//we can move back & forth between g3.Tips instances & jquery sets

var framewin = $('#stub iframe').get(0).contentWindow;

console.log('-----jQuery set-----');
console.log(
$('.tip > .tip', framewin.document).parent('.tip').
g3Tips({destroy: 'setC', name: 'setC', parent: framewin.document}).
to('jquery').
add('#_1 .convert', framewin.document).
g3Tips('setC').
to('jquery').length
);

console.log('-----jQuery from setC-----');
console.log(g3.Tips.get('setC').to('jquery').length);
</pre>
<p>Output:</p>
<pre>
-----jQuery set-----
23
-----jQuery from setC-----
23
</pre>
<p>What we should remember here is this simple:
<ul>
<li>library-to-Tips class with an empty argument leads us to function <code>g3.Tips</code></li>
<li>library-to-Tips class with a string argument
   <ol>
      <li>returns a <code>g3.Tips</code> object and sets <code>this.options.nodes</code> or,</li>
      <li>throws an exception</li>
   </ol>
</li>
<li>library-to-Tips class with an object argument
   <ol>
      <li>sets <code>this.options.nodes</code></li>
      <li>builds a new <code>g3.Tips</code> object and</li>
      <li>calls indirectly <code>init()</code></li>
   </ol>
</li>
</ul>
</p>

<h3>1.iv What <code>init()</code> does?</h3>
<p>If we realize what <code>init()</code> does we can't be tricked down by the operations:
<ol>
<li>moves nodes from temporary storage <code>this.options.nodes</code> to session one <code>this.instance.$nodes</code> and deletes <code>this.options.nodes</code></li>
<li>adds session storage <code>this.instance.$nodes</code> to permanent <code>this.instance.$allNodes</code></li>
<li>executes internal functions based on user options and</li>
<li>resets user options that can fire internal functions so the next cycle can start on</li>
</ol>
Remember that all internal functions operate upon session storage <code>this.instance.$nodes</code>.
</p>
<pre>
//we can use different sets to feed a g3.Tips instance
//load frame: test-g3Tips-stub1.html

var framewin = $('#stub iframe').get(0).contentWindow;

console.log('-----jQuery set-----');
console.log(
$('.tip > .tip', framewin.document).parent('.tip').
g3Tips({destroy: 'setC', name: 'setC', parent: framewin.document}).
to('jquery').length
);

console.log('build & fill an instance: init() was called indirectly');
console.log('--------------------------------');
console.log('options.nodes: '+$.g3Tips('setC').options.nodes.length);
console.log('instance.$nodes: '+$.g3Tips('setC').instance.$nodes.length);
console.log('instance.$allNodes: '+$.g3Tips('setC').instance.$allNodes.length);

console.log('-----another jQuery set-----');
console.log(
$('#_1 .convert', framewin.document).
g3Tips('setC').
to('jquery').length
);

console.log('call an instance: no init()');
console.log('--------------------------------');
console.log('options.nodes: '+$.g3Tips('setC').options.nodes.length);
console.log('instance.$nodes: '+$.g3Tips('setC').instance.$nodes.length);
console.log('instance.$allNodes: '+$.g3Tips('setC').instance.$allNodes.length);

$.g3Tips('setC').init({'nothing': 'to do'});

console.log('apply init() to an instance');
console.log('--------------------------------');
console.log('options.nodes: '+$.g3Tips('setC').options.nodes.length);
console.log('instance.$nodes: '+$.g3Tips('setC').instance.$nodes.length);
console.log('instance.$allNodes: '+$.g3Tips('setC').instance.$allNodes.length);
</pre>
<p>Output:</p>
<pre>
-----jQuery set-----
20
build & fill an instance: init() was called indirectly
--------------------------------
options.nodes: 0
instance.$nodes: 20
instance.$allNodes: 20
-----another jQuery set-----
3
call an instance: no init()
--------------------------------
options.nodes: 3
instance.$nodes: 20
instance.$allNodes: 20
apply init() to an instance
--------------------------------
options.nodes: 0
instance.$nodes: 3
instance.$allNodes: 23
</pre>
<small style="border: 2px gray dotted"><p><i>Development issues:</i> We were in need to have our functions a storage to operate upon which will be carefully crafted for the style sheets we use, e.g. we can't accept nodes that can't have children, nodes can come from different libraries and so on, so we created a session storage <code>this.instance.$nodes</code>. On the other hand, event handlers need memory to apply upon. As a result, a total sum of all nodes is stored on <code>this.instance.$allNodes</code> to be used by handlers.</p>
</small>

<h3>1.v Where is it? Destroy it!</h3>
<p>You can build an object and never store it because static members of <code>g3.Tips</code> safe guard it:</p>
<pre>
var who = g3.Tips.get('test'); //find it
g3.Tips.destroy('test'); //destroy it
</pre>
<p>All attached event handlers, node data, style sheets and style classes on nodes that belong to this specific collection are removed too.</p>
<p>With JQuery:</p>
<pre>
$.g3Tips.destroy('test')
//or,
$().g3Tips().destroy('test')
//but NOT
$.g3Tips({destroy: 'test'})
//or,
$().g3Tips({destroy: 'test'})
</pre>
<p>Whenever we jump into our object, instance property <code>this.options.nodes</code> is filled by the library's set.</p>
<small style="border: 2px gray dotted"><p><i>Development issues:</i> This object behaviour is what I call <i>hybrid</i>; an object that can live between two worlds.</p>
<p>On object's (re-)entry, it's first operations are to 
<ol>
<li>clear & fill property <code>this.instance.$nodes</code> with the library's set of nodes</li>
<li>add (accumulate) these nodes to <code>this.instance.$allNodes</code> and</li>
<li>clear <code>this.options.nodes</code>.</li>
</ol>
</p></small>

<h2>2. Operate</h2>
<h3>2.i Convert</h3>
<p>Let's convert some nodes having any class to <code>g3.Tips</code> nodes:</p>
<pre>
//this.convert(): nodes having a class

var framewin = $('#stub iframe').get(0).contentWindow,
    $nodes = $('#_1 .convert', framewin.document),
    titles = [],
    debug = {};

for(var i=0;i&lt; $nodes.length; i++)
   titles.push('Tooltip #' + (i + 1));

$nodes.g3Tips({destroy: 'convert', name: 'convert', parent: framewin.document, 'convert': true, 'titles': titles, position: '0', 'debug': debug});

console.log('-----internal function run-----');
console.log(debug);
</pre>
<p>Output:</p>
<pre>
-----internal function run-----

    [0] getStyles -> 'true'
    [0] getNodes -> 'true'
    [0] convert -> 'true'
    [0] applyTitle -> 'true'
    [0] applyPosition -> 'true'
    [0] applyHandlerTip -> 'false'
    [0] applyHandlerOrigin -> 'false'
    [0] applyDisplayHandler -> 'false'
    [0] applyOptimize -> 'false'
    [0] applyAnimation -> 'false'
    [0] applyEvents -> 'false'
</pre>
<p>Our nodes with class <code>.convert</code> obtained tooltips with messages set by us. The direction of the tooltips was set on top (0 degrees following the erroneous angle in css3 <code>linear-gradient</code>).</p>
<small style="border: 2px gray dotted"><p><i>Development issues:</i> The following data is set internally on the origins of the tooltips, origins are actually the set of nodes contained in <code>this.instance.$nodes</code>:
<pre>
'tip': {
   'pos': [top|bottom|right|left],     | -> in applyPosition()
   'handler': {
      'display': [true|false],         | -> in applyDisplayHandler()
      'tip': [as in options],          \ -> in applyHandlerTip()
      'tip_style': [class id],         /
      'origin': [as in options],       \
      'origin_style': [inline style],   |-> in applyHandlerOrigin(), event: resize, target: window,
      'origin_style_x': [inline style], |   handler: handlerOrigin()
      'origin_style_y': [inline style] /
   },
   optimize: [true|false],             \    in applyOptimize(), event: [resize], target: window,
   reset: [true|false],                 |-> event: [scroll], target: parent,
                                       /    handler: optimize()
   displayTip: [true|false],           |-> in applyDisplayTip()
   trackMouse: [true|false],           \   in applyTrackMouse(), event: [mouseenter, focus, mouseleave, blur],
                                        |-> target: node, handler: trackMouse(), event: [mousemove, click],
                                       /   target: node, handler: trackMouse2()
   animate: [true|false],              \ -> in applyAnimation(), event: [mouseenter, focus, click, mouseleave, blur],
   animateIn: [true|false]             /   target: node, handler: animate()
}
</pre>
on every operation cycle fired by <code>init()</code> some <i>actions</i> will set this data, e.g. actions on handler will set the <code>handler</code> property etc.</p></small>

<h3>2.ii Tooltip handlers</h3>
<p>We can move our handler in relation with the tooltip by inserting style rules in an embedded style sheet added at the bottom of document's <code>head</code>. This sheet has as <code>id</code> the name of the current object:</p>
<pre>
//this.applyHandlerTip()

//build one: 
var framewin = $('#stub iframe').get(0).contentWindow;
var debug = {};

new g3.Tips({destroy: 'test', name: 'test', parent: framewin.document, addStyled: true}).init({handlerTip: '25%', 'debug': debug});

console.log('-----internal function run-----');
console.log(debug);
</pre>
<p>Output:</p>
<pre>
-----internal function run-----

   1. [0] getStyles -> 'false'
   2. [0] getNodes -> 'true'
   3. [0] convert -> 'false'
   4. [0] applyTitle -> 'false'
   5. [0] applyPosition -> 'false'
   6. [0] applyHandlerTip -> 'true'
   7. [0] applyHandlerOrigin -> 'false'
   8. [0] applyDisplayHandler -> 'false'
   9. [0] applyOptimize -> 'false'
  10. [0] applyAnimation -> 'false'
  11. [0] applyEvents -> 'false'
</pre>
<p>Our handlers are moved to <code>25%</code> from the left/top side of the tooltip instead of the default <code>50%</code>. The more repetitions you make the more rules are added but the object is smart enough to clear rules that do not correspond to existed nodes in <code>this.instance.$allNodes</code> as is the case when we fire another value for the same set of nodes!</p>
<small style="border: 2px gray dotted"><p><i>Development issues:</i> At the end of every cycle fired by <code>init()</code> there is an automatic <code>autoClean()</code> function that it does among others a rule cleaning.</p>
<p>The result of 2 consecutive fires, one with <code>25%</code> and the last one with <code>75%</code> for an object named <code>test</code> is this style on head:
<pre>
<style id="test">
.tip > .test_2.tip.top:after, .tip > .test_2.tip.top:before, .tip > .test_2.tip.bottom:after, .tip > .test_2.tip.bottom:before {
    left: 75%;
}
.tip > .test_2.tip.left:after, .tip > .test_2.tip.left:before, .tip > .test_2.tip.right:after, .tip > .test_2.tip.right:before {
    top: 75%;
}
</style>
</pre>
the <code>25%</code> value has disappeared.</p>
</small>

<h3>2.iii Tooltip origin</h3>
<p>Can we reposition the handler compared with the origin in such a manner that this move will drift the whole tooltip? Yes, we can. Essentially this means that we re-position our tooltip based on the handler and not the distance of the tooltip to the origin as css rules do. Eventually, this behaviour is closer to what a user expects:</p>
<pre>
//this.applyHandlerOrigin()
//based on previous tab

var debug = {};
g3.Tips.get('test').init({handlerOrigin: '50%', 'debug': debug});

console.log('-----internal function run-----');
console.log(debug);
</pre>
<p>Output:</p>
<pre>
-----internal function run-----

   1. [0] getStyles -> 'false'
   2. [0] getNodes -> 'false'
   3. [0] convert -> 'false'
   4. [0] applyTitle -> 'false'
   5. [0] applyPosition -> 'false'
   6. [0] applyHandlerTip -> 'false'
   7. [0] applyHandlerOrigin -> 'true'
   8. [0] applyDisplayHandler -> 'false'
   9. [0] applyOptimize -> 'false'
  10. [0] applyAnimation -> 'false'
  11. [0] applyEvents -> 'true'
</pre>
<p>Our handlers are positioned at <code>25%</code> from the left/top side of the tooltip instead of the default <code>50%</code> and at the same time the handler is positioned at the centre of the origin.</p>
<small style="border: 2px gray dotted"><p><i>Development issues:</i> This scenario needs event handling capabilities; consider this case: the design is responsive <b>and</b> fluid (these are two different things) and a resize event fires then, it's highly possible for origins to change dimensions too and this forces our calculations about handler position to be redone.</p>
<p>This is not the end of the story though; a debounce function ensures the firing of one handler at the end of a resize event. It's this handler function that is been called by <code>init()</code> the first time user passes as argument <code>{handlerOrigin: value}</code>. The event handler needs some coordination and this is the role of node <code>data</code> that give information about where calculations should apply to, see<code>this.instance.$allNodes.data.tip.handler.origin</code>.</p>
<p>User can realize the existence of an event positioning handler with the value of <code>this.instance.on.handlerOrigin === true</code>:
<pre>
//this.handlerOrigin(): is active?
//based on previous tab

console.log('-----event handler for origin-----');
console.log($.g3Tips('test').instance.on);
</pre>
<p>Output:</p>
<pre>
-----event handler for origin-----

    [0] handlerOrigin -> 'true'
    [0] optimize -> 'true'
</pre>
</p>
</small>

<h3>2.iv Tooltip optimize</h3>
<p>This is a tough one: <i>"while the screen is scrolling we need to bring tooltips in view"</i>. Great idea but a nightmare to implement, but-you guess it-it's there!</p>
<pre>
//this.applyOptimize

var framewin = $('#stub iframe').get(0).contentWindow;
var debug1 = {},  debug2 = {};

//create a new embedded style sheet with rules
$('.tip > .tip', framewin.document).parent('.tip').g3Tips({destroy: 'test', name: 'test', parent: framewin.document, handlerOrigin: '50%', 'debug': debug1}).init({optimize: true, 'debug': debug2});

console.log('-----internal function run 1-----');
console.log(debug1);

console.log('-----internal function run 2-----');
console.log(debug2);
</pre>
<p>Output:</p>
<pre>
-----internal function run 1-----

   1. [0] getStyles -> 'true'
   2. [0] getNodes -> 'true'
   3. [0] convert -> 'false'
   4. [0] applyTitle -> 'false'
   5. [0] applyPosition -> 'false'
   6. [0] applyHandlerTip -> 'false'
   7. [0] applyHandlerOrigin -> 'true'
   8. [0] applyDisplayHandler -> 'false'
   9. [0] applyOptimize -> 'false'
  10. [0] applyAnimation -> 'false'
  11. [0] applyEvents -> 'true'

-----internal function run 2-----

   1. [0] getStyles -> 'false'
   2. [0] getNodes -> 'false'
   3. [0] convert -> 'false'
   4. [0] applyTitle -> 'false'
   5. [0] applyPosition -> 'false'
   6. [0] applyHandlerTip -> 'false'
   7. [0] applyHandlerOrigin -> 'false'
   8. [0] applyDisplayHandler -> 'false'
   9. [0] applyOptimize -> 'true'
  10. [0] applyAnimation -> 'false'
  11. [0] applyEvents -> 'true'
</pre>
<p>As you see we chained method <code>init()</code> the first one been called indirectly by the constructor.</p>
<small style="border: 2px gray dotted"><p><i>Development issues:</i> This scenario needs event handling capabilities too; only this time the handler is attached to the page scroll event; a debounce function ensures the firing of one handler at the end of a scroll. It's this handler function that is been called by <code>init()</code> the first time user passes as argument <code>{optimize: true}</code>. The event handler needs some coordination and this is the role of node <code>data</code> that give information about where calculations should apply to, see<code>this.instance.$allNodes.data.tip.optimized</code>.</p>
<p>User can realize the existence of an event optimized handler with the value of <code>this.instance.on.optimize === true</code>:
<pre>
//this.optimize(): is active?
//based on previous tab

console.log('-----event handler for optimize-----');
console.log($.g3Tips('test').instance.on);
</pre>
<p>Output:</p>
<pre>
-----event handler for origin-----

    [0] handlerOrigin -> 'true'
    [0] optimize -> 'true'
</pre>
</p>
</small>

<h3>2.v Tooltip position</h3>
<p>We can control where the tooltips will be set: top, bottom, left, right:</p>
<pre>
//this.applyPosition()

//destroy and rebuild with name collition!
var framewin = $('#stub iframe').get(0).contentWindow;
var debug = {};

$('.tip > .tip', framewin.document).parent('.tip').g3Tips({destroy: 'test', name: 'test', parent: framewin.document}).init({position: '270deg', 'debug': debug});

console.log('-----internal function run-----');
console.log(debug);
</pre>
<p>Output:</p>
<pre>
-----internal function run-----

   1. [0] getStyles -> 'false'
   2. [0] getNodes -> 'false'
   3. [0] convert -> 'false'
   4. [0] applyTitle -> 'false'
   5. [0] applyPosition -> 'true'
   6. [0] applyHandlerTip -> 'false'
   7. [0] applyHandlerOrigin -> 'false'
   8. [0] applyDisplayHandler -> 'false'
   9. [0] applyOptimize -> 'false'
  10. [0] applyAnimation -> 'false'
  11. [0] applyEvents -> 'false'
</pre>
<p>The top position is 0deg, the left 90deg and so on.</p>
<small style="border: 2px gray dotted"><p><i>Development issues:</i> The following node data is set with this option: <code>this.instance.$nodes.data.pos</code>.</p>
</small>

<h3>2.vi Handler display</h3>
<p>We can show or hide the handler:</p>
<pre>
//this.applyPosition()

//destroy and rebuild with name collition!
var framewin = $('#stub iframe').get(0).contentWindow;
var debug = {};

$('.tip > .tip', framewin.document).parent('.tip').g3Tips({destroy: 'test', name: 'test', parent: framewin.document}).init({position: '270deg', 'debug': debug});

console.log('-----internal function run-----');
console.log(debug);
</pre>
<p>Output:</p>
<pre>
-----internal function run-----

   1. [0] getStyles -> 'false'
   2. [0] getNodes -> 'false'
   3. [0] convert -> 'false'
   4. [0] applyTitle -> 'false'
   5. [0] applyPosition -> 'true'
   6. [0] applyHandlerTip -> 'false'
   7. [0] applyHandlerOrigin -> 'false'
   8. [0] applyDisplayHandler -> 'false'
   9. [0] applyOptimize -> 'false'
  10. [0] applyAnimation -> 'false'
  11. [0] applyEvents -> 'false'
</pre>
<p>The top position is 0deg, the left 90deg and so on.</p>
<small style="border: 2px gray dotted"><p><i>Development issues:</i> The following node data is set with this option: <code>this.instance.$allNodes.data.pos</code>.</p>
</small>

Usage
=====

Dependencies
============
<ol>
<li><code>g3.Class</code></li>
<li><code>g3.Error</code></li>
<li><code>g3.measure</code></li>
<li><code>g3.debounce</code></li>
<li><code>jquery.easing</code></li>
</ol>
<p>Everything is packed in <code>g3.Tips.all.min.js</code>. You have to pick the <code>.css</code> files though:</p>
<ol>
<li><code>g3.Tips.css</code></li>
<li><code>animate.css</code></li>
</ol>

Evaluator test page
===================
See: <a href="http://centurianii.github.io/g3Tips/">g3Tips</a>

Be cool, dream and have fun!