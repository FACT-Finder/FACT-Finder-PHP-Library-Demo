/*
 *
 * Copyright (c) 2006 Sam Collett (http://www.texotela.co.uk)
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 * 
 */

 
/*
 * Toggle all checkboxes contained within a form
 *
 * @name     toggleCheckboxes
 * @param    ignore  Checkboxes to ignore
 * @author   Sam Collett (http://www.texotela.co.uk)
 * @example  $("#myform").toggleCheckboxes();
 * @example  $("#myform").toggleCheckboxes("[@name=ignorethis]");
 *
 */
jQuery.fn.toggleCheckboxes = function(ignore)
{
	ignore = ignore || [];
	return this.each(
		function()
		{
			jQuery("input[@type=checkbox]", this).not(ignore).each(
				function()
				{
					this.checked = !this.checked;
				}
			)
		}
	)
}

/*
 * Check all checkboxes contained within a form
 *
 * @name     checkCheckboxes
 * @param    ignore  Checkboxes to ignore
 * @author   Sam Collett (http://www.texotela.co.uk)
 * @example  $("#myform").checkCheckboxes();
 * @example  $("#myform").checkCheckboxes("[@name=ignorethis]");
 *
 */
jQuery.fn.checkCheckboxes = function(ignore)
{
	ignore = ignore || [];
	return this.each(
		function()
		{
			jQuery("input[@type=checkbox]", this).not(ignore).each(
				function()
				{
					this.checked = true;
				}
			)
		}
	)
}

/*
 * UnCheck all checkboxes contained within a form
 *
 * @name     unCheckCheckboxes
 * @param    ignore  Checkboxes to ignore
 * @author   Sam Collett (http://www.texotela.co.uk)
 * @example  $("#myform").unCheckCheckboxes();
 * @example  $("#myform").unCheckCheckboxes("[@name=ignorethis]");
 *
 */
jQuery.fn.unCheckCheckboxes = function(ignore)
{
	ignore = ignore || [];
	return this.each(
		function()
		{
			jQuery("input[@type=checkbox]", this).not(ignore).each(
				function()
				{
					this.checked = false;
				}
			)
		}
	)
}

/*
 * Makes checkboxes behave like a radio button group
 *   i.e. only one can be selected at a time
 *
 * @name     radioCheckboxGroup
 * @param    name  field name
 * @author   Sam Collett (http://www.texotela.co.uk)
 * @example  $.radioCheckboxGroup("fieldname");
 *
 */
jQuery.radioCheckboxGroup = function(name)
{
	var x = jQuery("input[@name=" + name + "]");
	x.click(
		function()
		{
			// uncheck every other box with the same name
			x.not(this).each(
				function()
				{
					this.checked = false;
				}
			).end();
		}
	);
}