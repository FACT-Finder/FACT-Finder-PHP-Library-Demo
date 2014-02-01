/*
	A simple Plugin for JQuery to enhance its excellent XPath-like selectors.

	There are numerous debates on the JQuery forumm about the merits of these selectors.
	It is right to keep them out of the JQuery Base. They can be useful none the less, so
	perhaps there is a place for some of them in the Forms Plugin (until it gets moved into Base!)

	UPDATE 27-Sep-06: The ":modified" selector streamlined to use the .defaultValue .defaultSelected etc.

	This plugin adds the following selectors:

	Selector		- Usage example		- Description
	:hover			- $("DIV:hover")	- Find the element under the mouse.
	:focus			- $("INPUT:focus")	- Find the element that has the focus. This will typically be a <INPUT>, <TEXTAREA>, <SELECT>, <BUTTON> or <A> element.
	:blur			- $("INPUT:blur")	- Find the element that has just lost the focus. This will typically be a <INPUT>, <TEXTAREA>, <SELECT>, <BUTTON> or <A> element.
	:modified		- $("*:modified")	- Find <INPUT>, <TEXTAREA> or <SELECT> elements who's value or checked attribute has changed since the page loaded. (For <INPUT> elements, this only applies where type = text, file, hidden or password)
	:Contains		- $("DIV:Contains('some text')") - Same as :contains() but is case insensitive.
	:input			- $("*:input")		- Find <INPUT>, <TEXTAREA>, <SELECT> or <BUTTON> elements.
	:option			- $("*:option")		- Find multiple/choice form items: RADIO, CHECKBOX and OPTION elements.
	:option-def		- $("*:option-def")  Find <OPTION> elements that were selected originally, before changes were made.
	:option-mod		- $("*:option-mod") Find <OPTION> elements selected or unselected since page loaded. Same as :modified but is for <OPTION> elements only.
	:text			- $("*:text")		- Find TEXT and TEXTAREA elements.		Equivalent to $("INPUT[@type='text']")
	:radio			- $("*:radio")		- Find <INPUT type="radio"> elements.	Equivalent to $("INPUT[@type='radio']")
	:checkbox		- $("*:checkbox")	- Find <INPUT type="checkbox"> elements.Equivalent to $("INPUT[@type='checkbox']")
	:button			- $("*:button")		- Find <INPUT type="button"> and <BUTTON> elements.	Equivalent to $("INPUT[@type='button'], BUTTON")
	:image			- $("*:image")		- Find <INPUT type="image"> and <IMG> elements.		Equivalent to $("INPUT[@type='image'], IMG")
	:file			- $("*:file")		- Find <INPUT type="file">.				Equivalent to $("INPUT[@type='file']")
	:password		- $("*:password")	- Find <INPUT type="password"> elements.Equivalent to $("INPUT[@type='password']")
	:submit			- $("*:submit")		- Find <INPUT type="submit"> elements.	Equivalent to $("INPUT[@type='submit']")
	:reset			- $("*:reset")		- Find <INPUT type="reset"> elements.	Equivalent to $("INPUT[@type='reset']")
	:textarea		- $("*:textarea")	- Find <TEXTAREA> elements.				Equivalent to $("TEXTAREA"). Only included for continuity with the INPUT selectors. Not particularly useful!
	:select			- $("*:select")		- Find <SELECT>   elements.				Equivalent to $("SELECT").   Only included for continuity with the INPUT selectors. Not particularly useful!
	:multiple		- $("*:multiple")	- Find <SELECT multiple> elements.		Equivalent to $("SELECT[@multiple]"). Only included for continuity with the INPUT selectors.
	:selected		- $("*:selected")	- Find <SELECT> elements with 1 or more selections, and all <OPTION> elements that are selected.
	:nth-last-child	- 
	:only-of-type	- 
	:nth-of-type	- 
	:first-of-type	- 
	:last-of-type	- 
	:nth-child-of-type  -
	:last-child-of-type -
	:in-view		- 

	Written by George Adamson, Software Unity, September 2006 (george.jquery@softwareunity.com).
	v1.0	- 27-Sep-2006 Released.
	v1.0a	- 28-Sep-2006 Added ":selected" and "nth-last-child", improved ":modified", reduced code size.
	v1.0b	- 02-Oct-2006 Added ":Contains()" and various "xxx-of-type()" selectors.
	v1.0c	- 03-Oct-2006 Added ":nth-child-of-type()", enhanced "xxx-of-type()" selectors to distinguish INPUT tags by type and to filter on the set rather than siblings.

*/


// Make Jquery aware of the new selectors:
jQuery.extend(jQuery.expr[':'], {
	hover:			"a==document.hoverElement",			// hoverElement is custom property maintained by dedicated document.mouseover event.
	focus:			"a==document.activeElement",		// activeElement is natively available in IE. Is custom property in other browsers, maintained by dedicated blur/focus events.
	blur:			"a==document.lastActiveElement",	// lastActiveElement is custom property maintained by dedicated blur/focus events.
	Contains:		"(a.innerText||a.innerHTML).toUpperCase().indexOf(m[3].toUpperCase())>=0",	// Same as :contains() but ignores case.
	modified:		"(a.nodeName=='INPUT' && (a.type=='checkbox' || a.type=='radio') && a.defaultChecked != a.checked) || (a.nodeName=='INPUT' && 'text,hidden,file,password'.indexOf(a.type) != -1 && a.defaultValue != a.value) || (a.nodeName=='TEXTAREA' && a.defaultValue != a.value) || (a.nodeName=='SELECT' &&  jQuery('OPTION:option-mod',a).is() )",
	input:			"a.nodeName=='INPUT' || a.nodeName=='SELECT' || a.nodeName=='TEXTAREA' || a.nodeName=='BUTTON'",
	text:			"(a.nodeName=='INPUT' && a.type=='text') || a.nodeName=='TEXTAREA'",
	radio:			"a.nodeName=='INPUT' && a.type=='radio'",
	button:			"(a.nodeName=='INPUT' && 'button,submit,reset,image'.indexOf(a.type) >= 0) || a.nodeName=='BUTTON'",
	checkbox:		"a.nodeName=='INPUT' && a.type=='checkbox'",
	file:			"a.nodeName=='INPUT' && a.type=='file'",
	password:		"a.nodeName=='INPUT' && a.type=='password'",
	image:			"a.nodeName=='IMG' || (a.nodeName=='INPUT' && a.type=='image')",
	submit:			"a.nodeName=='INPUT' && a.type=='submit'",
	reset:			"a.nodeName=='INPUT' && a.type=='reset'",
	textarea:		"a.nodeName=='TEXTAREA'",
	select:			"a.nodeName=='SELECT'",
	multiple:		"a.nodeName=='SELECT' && a.multiple",
	selected:		"(a.nodeName=='SELECT' && jQuery('OPTION[@selected]',a).is()) || (a.nodeName=='OPTION' && a.selected)",
	option:			"(a.nodeName=='OPTION') || ( a.nodeName=='INPUT' && (a.type=='checkbox' || a.type=='radio') )",
	"option-sel":	"(a.nodeName=='OPTION' && a.selected) || (a.nodeName=='INPUT' && (a.type=='checkbox' || a.type=='radio') && a.checked)",
	"option-def":	"(a.nodeName=='OPTION' && a.defaultSelected) || (a.nodeName=='INPUT' && (a.type=='checkbox' || a.type=='radio') && a.defaultChecked)",
	"option-mod":	"(a.nodeName=='OPTION' && a.defaultSelected != a.selected) || (a.nodeName=='INPUT' && (a.type=='checkbox' || a.type=='radio') && a.defaultChecked != a.checked)",
	"nth-last-child":"jQuery.sibling(a,jQuery.sibling(a).length-1-m[3]).cur",

	// WARNING! The following are WORK IN PROGRESS...! (They are unfinished or not fully tested)

	// Thought: Maybe xxx-of-type selectors should be using r.filter() instead of a.siblings() ?
	"nth-of-type":	"a==jQuery(a.nodeName		  + (a.nodeName=='INPUT' ? '[@type='+a.type+']' : ''), r).get(m[3])",		
	"first-of-type":"a==jQuery(a.nodeName		  + (a.nodeName=='INPUT' ? '[@type='+a.type+']' : ''), r).get(0)",		
	"last-of-type":	"a==jQuery(a.nodeName+':last' + (a.nodeName=='INPUT' ? '[@type='+a.type+']' : ''), r).get(0)",
	"only-of-type":	"1==jQuery(a.nodeName		  + (a.nodeName=='INPUT' ? '[@type='+a.type+']' : ''), r).size()",		

	"nth-child-of-type":	"a==jQuery(a).siblings(a.nodeName         + (a.nodeName=='INPUT' ? '[@type=' + a.type + ']' : '') ).get(m[3])",
	"last-child-of-type":	"a==jQuery(a).siblings(a.nodeName+':last' + (a.nodeName=='INPUT' ? '[@type=' + a.type + ']' : '') ).get(0)",	

	"in-view":		"a.scrollTop == 0 && jQuery(a).parent().is(':in-view')",// Find elements that are within the visible area or a scolled page or parent element.
	color:			"a.currentStyle.color == m[3]",							// TODO: Lookup common colour names to match #rrggbb format?
	"border-color":	"a.currentStyle.borderColor == m[3]",					// TODO: Lookup common colour names to match #rrggbb format?
	"bg-color":		"a.currentStyle.backgroundColor == m[3]",				// TODO: Lookup common colour names to match #rrggbb format?
	"bg-url":		"a.currentStyle.backgroundImage.toLowerCase().indexOf(m[3].toLowerCase()) != -1"	// Work in progress!

	// Params available to the selector definitions:
	//	r		= array of elements being scrutinised. (r.length = Number of elements)
	//	i		= index of element currently under scrutiny. (Position in r)
	//	a		= element currently under scrutiny. Selector may return true to include it in the results.
	//	m[2]	= nodeName or * that we a looking for (left of colon).
	//	m[3]	= param passed into the :selector(param). Typically an index number.
});

// Some of the new selectors rely on custom attributes or events.
// Set these up as soon as the document has loaded:
$(function(){

	// Please ignore this commented snippit. It is used for testing!...
	/*$(document).mouseover(function(e){

		var el = e.target || e.srcElement;
		//status = el.parentNode.offsetHeight + ' ' + el.scrollHeight + ' ' + el.scrollTop + ' ' + el.parentNode.scrollTop;
		status = el.currentStyle.backgroundImage;

	});*/

	document.lastActiveElement = document.body;	// Custom property to record previous activeElement setting.

	// Add support for ":focus" and ":blur"
	// Add events to support document.activeElement in browsers that do not do it natively.
	// Works by tracking onBlur and onFocus events of all input and list elements.
	// The focus & blur events do not bubble so we cannot just watch them at the document level.
	// (But in IE there is an ondeactivate event that should serve us just as well.)
	// KNOWN ISSUE: This will not work on any elements created since the page loaded.
	// KNOWN ISSUE: Page load will be slower if there are alot of form elements. (n/a IE)
	if(document.activeElement && $.browser.msie) {

		// For browsers that natively support document.activeElement (such as IE):
		// Add onblur handler(s) to maintain lastActiveElement property for the :blur selector.
		// (No need to add onfocus evt handlers to maintain activeElement for the :focus selector.)

		// IE provides the ondeactivate event that bubbles to the document level so lets use that:
		// At least IE users can benefit from not having to add event handlers to every form element!
		$(document).bind("deactivate", function(e){

			// Make a note of the current activeElement before it loses focus:
			if(e.srcElement != document.body) document.lastActiveElement = e.srcElement;

		});

		/*
			// For browsers other than IE that also support the activeElement property:
			// Add onblur handlers to maintain lastActiveElement property for the :blur selector.
			// (At the time of writing there were no other browsers so this may never be needed!)
			$("INPUT, SELECT, TEXTAREA, BUTTON")

				.blur(function(e){
					// Make a note of the current activeElement before it loses focus:
					document.lastActiveElement = e.srcElement || e.target;
				});
		*/

	} else {

		// For browsers that do not natively support document.activeElement:
		// Add onblur handlers to maintain lastActiveElement property for the :blur selector.
		// Add onfocus handlers to maintain activeElement property for the :focus selector.

		document.activeElement = document.body;	// Custom property to mimic the native IE property.

		$("INPUT, SELECT, TEXTAREA, BUTTON")

			.blur(function(e){
				// Make a note of the current activeElement before it loses focus:
				document.lastActiveElement = e.target;
				document.activeElement = document.body;
			})

			.focus(function(){
				// Update activeElement that gained focus:
				document.activeElement = this;
			});

	}


	// Add support for ":hover"
	// Add event to maintain custom document.hoverElement property:
	// This enables use of the custom :hover selector.
	// KNOWN ISSUE: e.srcElement is not always up to date when we use mouseover.
	// (mouseover would be lighter on cpu than mousemove but srcElement is not always up to date in certain circumstances!)
	$(document).mousemove(function(e){

		document.hoverElement = e.target || e.srcElement;

	});

});