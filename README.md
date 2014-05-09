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
<li>Tooltip-to-handler</li>
<li>Tooltip-to-origin</li>
<li>Tooltip optimize</li>
<li>Tooltip position</li>
<li>Handler display</li>
<li>Tooltip display</li>
<li>Track mouse</li>
<li>Change animation</li>
</ol>
</li>
</ol>

<h2>1. Construction</h2>
<h3>1.i Autonomous object</h3>
<p>Let's create an empty object with default name <code>g3Tips</code> and debug enabled to catch some internal function output:</p>
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

    [0] getNodes -> 'false'
    [0] convert -> 'false'
    [0] applyTitle -> 'false'
    [0] applyPosition -> 'false'
    [0] applyHandlerTip -> 'false'
    [0] applyHandlerOrigin -> 'false'
    [0] applyDisplayHandler -> 'false'
    [0] applyOptimize -> 'false'
    [0] applyDisplayTip -> 'false'
    [0] applyTrackMouse -> 'false'
    [0] applyAnimation -> 'false'
    [0] applyEvents -> 'false'
</pre>
<p>As you can see the object contains 2 objects as members, 1 array and 4 functions. From the perspective of user only <code>this.instance.$allNodes</code>, <code>this.instance.$nodes</code> and <code>this.init()</code> are really usable. So, there is no function-to-user interface which is brilliant! Everything is controlled from options, our <b><i>switchboard</i></b>.</p>
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
<p>The initial idea was that simple: <i>"one set of nodes is handled by one object g3.Tips"</i> and in that situation <code>this.instance.$nodes</code> would be enough. Going one step further I decided to satisfy this demand: <i>"I want to chain commands and every one can work with a different set"</i>. This is possible too, keep reading on <i>(1.iii).</i></p>
<blockquote style="border: 2px gray dotted"><i>Development issues:</i> Even in the situation of chaining commands, <code>this.instance.$nodes</code> is still enough as it is refilled by your new collection every time. Do you need  memory for your sets? Just forget it! Actually you don't need memory, (re-)collect a new set drop it in and apply whatever you want using options object <i>(switchboard)</i>.</blockquote>
<p>The next step was to satisfy an optimized request: <i>"I want my tooltips to be repositioned when the visible area is scrolling"</i>. You have it!</p>
<blockquote style="border: 2px gray dotted"><p><i>Development issues:</i> That one, brought events in play that operate <b>after</b> the firing of all methods and now we do need a memory variable <code>this.instance.$allNodes</code> to operate upon!</p>
<p>This is not the end of the story though, every node in our collection stores data about it's last condition so optimization mess up can be reverted. Just fine!</blockquote>

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
<p>it collected 20 nodes setting <code>this.instance.$nodes = this.instance.$allNodes = 20</code>-we could operate upon them-then, it collected 3 where <code>this.instance.$nodes = 3</code> but <code>this.instance.$allNodes = 23</code>-we could operate upon the last 3.</p>
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
<li>resets user options that can fire internal functions so the next cycle can start on (like <code>handlerTip</code> that fires <code>applyHandlerTip()</code>, <code>handlerOrigin</code> that fires <code>applyHandlerOrigin()</code> etc.)</li>
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
<blockquote style="border: 2px gray dotted"><p><i>Development issues:</i> Our functions need a storage to operate upon and these nodes should be carefully crafted for the style sheets in use, e.g. we can't accept nodes that can't have children, nodes can come from different libraries and so on, so we created a session storage <code>this.instance.$nodes</code>. On the other hand, event handlers need some memory to apply upon. As a result, a total sum of all nodes is stored on <code>this.instance.$allNodes</code> to be used by handlers.</p>
</blockquote>

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
<blockquote style="border: 2px gray dotted"><p><i>Development issues:</i> This object behaviour is what I call <i>hybrid</i>; an object that can live between two worlds.</p>
<p>On object's (re-)entry, it's first operations are to 
<ol>
<li>clear & fill property <code>this.instance.$nodes</code> with the library's set of nodes</li>
<li>add (accumulate) these nodes to <code>this.instance.$allNodes</code> and</li>
<li>clear <code>this.options.nodes</code>.</li>
</ol>
</p></blockquote>

<h2>2. Operate</h2>
<h3>2.i Convert</h3>
<p>Let's convert some nodes to <code>g3.Tips</code> nodes:</p>
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

    [0] getNodes -> 'true'
    [0] convert -> 'true'
    [0] applyTitle -> 'true'
    [0] applyPosition -> 'true'
    [0] applyHandlerTip -> 'false'
    [0] applyHandlerOrigin -> 'false'
    [0] applyDisplayHandler -> 'false'
    [0] applyOptimize -> 'false'
    [0] applyDisplayTip -> 'false'
    [0] applyTrackMouse -> 'false'
    [0] applyAnimation -> 'false'
    [0] applyEvents -> 'false'
</pre>
<p>Our nodes with class <code>.convert</code> obtained tooltips with messages set by us. The direction of the tooltips was set on top (0 degrees following the erroneous angle in css3 <code>linear-gradient</code>).</p>
<blockquote style="border: 2px gray dotted"><p><i>Development issues:</i> The following data is set internally on the origins of the tooltips, origins are actually the set of nodes contained in <code>this.instance.$nodes</code>:
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
                                       \   in applyTrackMouse(), event: [mouseenter, focus, mouseleave, blur],
   trackMouse: [true|false],            |-> target: node, handler: trackMouse(), event: [mousemove, click],
                                       /   target: node, handler: trackMouse2()
   animate: [true|false],              \ -> in applyAnimation(), event: [mouseenter, focus, click, mouseleave, blur],
   animateIn: [true|false]             /   target: node, handler: animate()
}
</pre>
on every operation cycle fired by <code>init()</code> some <i>actions</i> will set this data, e.g. actions on handler will set the <code>handler</code> property etc.</p></blockquote>

<h3>2.ii Tooltip-to-handler</h3>
<p>We can move our handler in relation with the tooltip by inserting style rules to the <code>div</code> that represents it (no more embedded stylesheets in head as other would do):</p>
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

   [0] getNodes -> 'true'
   [0] convert -> 'false'
   [0] applyTitle -> 'false'
   [0] applyPosition -> 'false'
   [0] applyHandlerTip -> 'true'
   [0] applyHandlerOrigin -> 'false'
   [0] applyDisplayHandler -> 'false'
   [0] applyOptimize -> 'false'
   [0] applyDisplayTip -> 'false'
   [0] applyTrackMouse -> 'false'
   [0] applyAnimation -> 'false'
   [0] applyEvents -> 'false'
</pre>
<p>Our handlers are moved to <code>25%</code> from the left/top side of the tooltip instead of the default <code>50%</code>. The more repetitions you make the more rules are put in place of the old ones.</p>
<blockquote style="border: 2px gray dotted"><p><i>Development issues:</i> At initial development stage it was decided to use embedded stylesheets in document's head that lead to a nightmare administering non-used with used ones; after re-designing our style rules all problems cleared!</p>
</blockquote>

<h3>2.iii Tooltip-to-origin</h3>
<p>Can we reposition the handler compared with the origin in such a manner that this move will drift the whole tooltip? Yes, we can. Essentially this means that we re-position our tooltip based on the handler and not the distance of the tooltip to the origin as css rules do. Eventually, this behaviour is closer to what a user expects:</p>
<pre>
//this.applyHandlerOrigin()
//based on previous tab

var debug = {};
g3.Tips.get('test').init({handlerTip: '25%', handlerOrigin: '50%', 'debug': debug});

console.log('-----internal function run-----');
console.log(debug);
</pre>
<p>Output:</p>
<pre>
-----internal function run-----

   [0] getNodes -> 'false'
   [0] convert -> 'false'
   [0] applyTitle -> 'false'
   [0] applyPosition -> 'false'
   [0] applyHandlerTip -> 'true'
   [0] applyHandlerOrigin -> 'true'
   [0] applyDisplayHandler -> 'false'
   [0] applyOptimize -> 'false'
   [0] applyDisplayTip -> 'false'
   [0] applyTrackMouse -> 'false'
   [0] applyAnimation -> 'false'
   [0] applyEvents -> 'true'
</pre>
<p>Our handlers are positioned at <code>25%</code> from the left/top side of the tooltip instead of the default <code>50%</code> and at the same time the handler is positioned at the centre of the origin.</p>
<blockquote style="border: 2px gray dotted"><p><i>Development issues:</i> This scenario needs event handling capabilities; consider this case: the design is responsive <b>and</b> fluid (these are two different things) and a resize event fires then, it's highly possible for origins to change dimensions too and this forces our calculations about handler position to be redone.</p>
<p>This is not the end of the story though; a debounce function ensures the firing of one handler at the end of a resize event. It's this handler function that is been called by <code>init()</code> the first time user passes as argument <code>{handlerOrigin: value}</code>. The event handler needs some coordination and this is the role of node <code>data</code> that give information about where calculations should apply to, see nodes' data at <code>this.data.tip.handler.origin</code>.</p>
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
</blockquote>

<h3>2.iv Tooltip optimize</h3>
<p>This is a tough one: <i>"while the screen is scrolling we need to bring tooltips in view"</i>. Great idea but a nightmare to implement, but-you guess it-it's there!</p>
<pre>
//this.applyHandlerOrigin() + this.applyOptimize(): run side-by-side
//based on previous tab

var framewin = $('#stub iframe').get(0).contentWindow;
var debug = {};

$('.tip > .tip', framewin.document).parent('.tip').g3Tips({destroy: 'test', name: 'test', parent: framewin.document, 
handlerOrigin: '50%', optimize: true, 'debug': debug});

console.log('-----internal function run-----');
console.log(debug);

console.log('-----data(\'tip\') for #hugeOrigin-----');
console.log($('#hugeOrigin', framewin.document).data('tip'), 1);

console.log('-----event handlers-----');
console.log($.g3Tips('test').instance.on);
</pre>
<p>Output:</p>
<pre>
-----internal function run-----

    [0] getNodes -> 'true'
    [0] convert -> 'false'
    [0] applyTitle -> 'false'
    [0] applyPosition -> 'false'
    [0] applyHandlerTip -> 'false'
    [0] applyHandlerOrigin -> 'true'
    [0] applyDisplayHandler -> 'false'
    [0] applyOptimize -> 'true'
    [0] applyDisplayTip -> 'false'
    [0] applyTrackMouse -> 'false'
    [0] applyAnimation -> 'false'
    [0] applyEvents -> 'true'

-----data('tip') for #hugeOrigin-----

    [0] pos -> 'bottom'
    [0] handler -> 'object'[object Object]
    [1] origin -> '50%'
    [1] origin_style -> 'left: 28px;'
    [1] origin_style_x -> 'left: 28px;'
    [0] optimize -> 'true'

-----event handlers-----

    [0] handlerOrigin -> 'true'
    [0] optimize -> 'true'
</pre>
<p>Method <code>init()</code> could have been called successively breaking options in two groups, the first time by  the constructor and the second one explicitly.</p>
<blockquote style="border: 2px gray dotted"><p><i>Development issues:</i> This scenario needs event handling capabilities too; only this time the handler is attached to the page scroll event; a debounce function ensures the firing of one handler at the end of a scroll. It's this handler function that is been called by <code>init()</code> the first time user passes as argument <code>{optimize: true}</code>. The event handler needs some coordination and this is the role of node <code>data</code> that give information about where calculations should apply to, see node's data <code>this.data.tip.optimized</code>.</p>
<p>User can realize the existence of an event optimized handler with the value of <code>this.instance.on.optimize === true</code>
</p>
</blockquote>

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

   [0] getNodes -> 'false'
   [0] convert -> 'false'
   [0] applyTitle -> 'false'
   [0] applyPosition -> 'true'
   [0] applyHandlerTip -> 'false'
   [0] applyHandlerOrigin -> 'false'
   [0] applyDisplayHandler -> 'false'
   [0] applyOptimize -> 'false'
   [0] applyDisplayTip -> 'false'
   [0] applyTrackMouse -> 'false'
   [0] applyAnimation -> 'false'
   [0] applyEvents -> 'false'
</pre>
<p>The top position is 0deg, the left 90deg and so on.</p>
<blockquote style="border: 2px gray dotted"><p><i>Development issues:</i> The following node data is set with this option: <code>this.data.pos</code>.</p>
</blockquote>

<h3>2.vi Handler display</h3>
<p>We can show or hide the handler:</p>
<pre>
//this.applyDisplayHandler(): show
//based on previous tab

var debug = {};

g3.Tips.get('test').init({displayHandler: true, 'debug': debug});

console.log('-----internal function run-----');
console.log(debug);
</pre>
<p>Output:</p>
<pre>
-----internal function run-----

   [0] getNodes -> 'false'
   [0] convert -> 'false'
   [0] applyTitle -> 'false'
   [0] applyPosition -> 'false'
   [0] applyHandlerTip -> 'false'
   [0] applyHandlerOrigin -> 'false'
   [0] applyDisplayHandler -> 'true'
   [0] applyOptimize -> 'false'
   [0] applyDisplayTip -> 'false'
   [0] applyTrackMouse -> 'false'
   [0] applyAnimation -> 'false'
   [0] applyEvents -> 'false'
</pre>
<blockquote style="border: 2px gray dotted"><p><i>Development issues:</i> The following node data is set with this option: <code>this.data.pos</code>.</p>
</blockquote>

<h3>2.vii Tooltip display</h3>
<p>We can show or hide the entire tooltip:</p>
<pre>
//this.applyDisplayTip(): false
//based on previous tab

var debug = {};

g3.Tips.get('test').init({displayTip: true, 'debug': debug});

console.log('-----internal function run-----');
console.log(debug);
</pre>
<p>Output:</p>
<pre>
-----internal function run-----

    [0] getNodes -> 'false'
    [0] convert -> 'false'
    [0] applyTitle -> 'false'
    [0] applyPosition -> 'false'
    [0] applyHandlerTip -> 'false'
    [0] applyHandlerOrigin -> 'false'
    [0] applyDisplayHandler -> 'false'
    [0] applyOptimize -> 'false'
    [0] applyDisplayTip -> 'true'
    [0] applyTrackMouse -> 'false'
    [0] applyAnimation -> 'false'
    [0] applyEvents -> 'false'
</pre>
<blockquote style="border: 2px gray dotted"><p><i>Development issues:</i> The following node data is set with this option: <code>this.data.pos</code>. Re-enabling with <code>{displayTip: false}</code> means normal behaviour css-based is restored with mouse enter/leave or focus/blur.</p>
</blockquote>

<h3>2.viii Track mouse</h3>
<p>We can make the tooltip to follow the mouse on any origin:</p>
<pre>
//this.applyTrackMouse()

var framewin = $('#stub iframe').get(0).contentWindow;
var debug = {};

$('#trackmouse', framewin.document).g3Tips({destroy: 'track', name: 'track', parent: framewin.document, convert: true, titles: ['tracking the mouse...'], position: '-90deg', trackMouse: true, 'debug': debug});

</pre>
<p>Output:</p>
<pre>
-----internal function run-----

    [0] getNodes -> 'true'
    [0] convert -> 'true'
    [0] applyTitle -> 'true'
    [0] applyPosition -> 'true'
    [0] applyHandlerTip -> 'false'
    [0] applyHandlerOrigin -> 'false'
    [0] applyDisplayHandler -> 'false'
    [0] applyOptimize -> 'false'
    [0] applyDisplayTip -> 'false'
    [0] applyTrackMouse -> 'true'
    [0] applyAnimation -> 'true'
    [0] applyEvents -> 'true'
</pre>
<blockquote style="border: 2px gray dotted"><p><i>Development issues:</i> The following node data is set with this option: <code>this.data.trackMouse</code>. Disable with <code>{off: 'trackMouse'}</code>.</p>
</blockquote>

<h3>2.ix Change animation</h3>
<p>We can apply a different css animation based on file <code>animate.css</code> that contains tens of animations:</p>
<pre>
//this.applyAnimation(): add style animation

$.g3Tips('test').init({animation: 'fadeInDownBig'});
</pre>
<p>We can convert a css to a javascript animation:</p>
<pre>
//this.applyAnimation(): add js animation

$.g3Tips('test').init({animation: true, duration: 1000});
</pre>
<p>We can change easing function to a javascript animation:</p>
<pre>
//this.applyAnimation(): this.applyAnimation(): change easing functions in js animation

$.g3Tips('test').init({animation: true, duration: 1000, animationIn: 'easeInCubic', animationOut: 'easeOutQuint'});
</pre>
<p>We can change the starting and ending distances of tooltips to a javascript animation:</p>
<pre>
//this.applyAnimation(): change from-to in js animation

$.g3Tips('test').init({animation: true, duration: 200, animationIn: 'easeInQuart', animationOut: 'easeOutQuart', from: '80%', to: '150%'});
</pre>
<p>We can change the starting and ending events in a javascript animation:</p>
<pre>
//this.applyAnimation(): this.applyAnimation(): change events in js animation

$.g3Tips('test').init({animation: true, duration: 200, animationIn: 'easeInQuint', animationOut: 'easeOutQuint', from: '150%', to: '300%', eventIn: 'click', eventOut: 'click'});
</pre>
<blockquote style="border: 2px gray dotted"><p><i>Development issues:</i> The following node data is set with this option: <code>this.data.animate</code>. You can't disable a javascript animation with: <code>{animation: false/'styled'}</code>; use instead: <code>{off: 'animation'}</code> to revert to css behaviour and additionally re-apply the style animation you want as we've done it above.</p>
</blockquote>

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
