var follow_up_setupwizard = 
{
	setupComplete : function()
	{
		this.prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		window.arguments[0].out = document.getElementById("calItem").selectedIndex;
		return true;
	},
}