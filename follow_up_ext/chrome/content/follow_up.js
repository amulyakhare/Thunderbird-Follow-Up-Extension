 var follow_up_ext = {
  /*This function is called when the extension loads*/
  onLoad: function() 
  {
    this.initialized = true;
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
	this.tagService = Components.classes["@mozilla.org/messenger/tagservice;1"].getService (Components.interfaces.nsIMsgTagService);
	//set a timeout to prevent lag in loading.
	setTimeout(
        
		function()
		{
			//set overdue tags as pending.
			follow_up_ext.setPendingTags();
			//clear those tags which are no longer used.
    
			//follow_up_ext.clearUnusedTags();
        },1000)
  },
  
  /*
  This function is called when a new follow up is to be added.
  It calls the datepicker window, creates / adds the tag to the email
  and calls the Lightning methods to create a calendar task / event
  */
  addFollowUp: function()
  {
  	//open the datepicker window.
  	var params = { out: null };
    window.openDialog("chrome://follow_up_ext/content/date_dialog.xul", "", "modal", params).focus();
    
    //if a date was selected by the user.
    if (params.out != null) 
    {
    	var date = params.out;
        if (follow_up_ext.prefs.getIntPref("extensions.follow_up_ext.calpref") == 1)
        {
        	LightningEvent.createNewEvent(date);
        }
        else
        {
        	LightningEvent.createNewTask(date);
        }
        //create the tag.
        var d = "Follow Up: " + date.getDate().toString() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear().toString();
        if (!follow_up_ext.tagService.getKeyForTag(d))
        {
        	follow_up_ext.tagService.addTag(d, "#33CC00", "");
        }
        //add the tag to the email.
        ToggleMessageTag(follow_up_ext.findTagKey(d), true);
    }
  },
  
  /*
  This function marks done ALL the follow up tags set for that email. 
  It also removes / modifies the event / task associated with that tag.
  */
  markDone: function()
  {
  	//get all the tags existing in Thunderbird.
  	var allTags = follow_up_ext.tagService.getAllTags({});
	
	//loop through all the tags
	for (var i = 0; i < allTags.length; i++) 
	{
		var tagname = allTags[i].tag;
		
		//check if it is a follow up or pending tag.
        var initial = tagname.substring(0, 10);
        if (initial == "Follow Up:" || initial == "Pending Si") 
        {
        	key = allTags[i].key;
        	var msgHdr = gDBView.hdrForFirstSelectedMessage;
        	var curKeys = msgHdr.getStringProperty("keywords");
        	
        	//if message has this particular tag.
        	if (curKeys.indexOf(key) != -1)
        	{
        		//extract the date of this tag.
        		var dateString = allTags[i].tag.substring(11).split("/");
        		var month = parseInt(dateString[1]) - 1;
        		var date = new Date(dateString[2], month, dateString[0]);
                
                //remove the tag from the email.
                ToggleMessageTag(key, false);
                
                if (follow_up_ext.prefs.getIntPref("extensions.follow_up_ext.calpref") == 1)
                {
                	LightningEvent.removeAnEvent(date);
                }
                else
                {
                	LightningEvent.removeATask(date);
                }
            }
        }
    }
  },
  
  /*
  This function shows the follow ups for a particular date as passed it.
  It makes use of the Thunderbird Quick Filter Bar UI to display these emails.
  */
  viewFollowUp : function(date)
  {
  	//find the tag for the particular date.
  	var d = "Follow Up: " + date.getDate().toString() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear().toString();
    var key = follow_up_ext.findTagKey(d);

    var qfb = document.getElementById("qfb-show-filter-bar");
    var qfb_status = qfb.checked;
    if (!qfb_status) 
    {
    	qfb.click();
    }
    
    var qfb_tag = document.getElementById("qfb-tags");
    var qfb_tag_status = qfb_tag.checked;
    if (!qfb_tag_status) 
    {
    	qfb_tag.click();
    }

	//set timeout for the UI elements to load.
    setTimeout(
		function () 
		{
        	var tagButton = document.getElementById("qfb-tag-" + key);
            //if no such tag element is found.
            if (tagButton == null) 
            {
                var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
                promptService.alert(null, "Follow Up", "You have no mails to follow up!");
                ////reset the button state.
                if (!qfb_tag_status)
                {
                    qfb_tag.click();
                }
                if (!qfb_status) {
                    qfb.click();
                }
            }
			//show the filtered emails.
            tagButton.click();
        }, 1000)
  },
  
  /*
  This funtion show all the pending mails using the Thunderbird
  Quick Filter Bar.
  */
  viewPending : function()
  {
  	var pending_count = 0;
    
    var qfb = document.getElementById("qfb-show-filter-bar");
    var qfb_status = qfb.checked;
    if (!qfb_status) 
    {
        qfb.click();
    }
    
    var qfb_tag = document.getElementById("qfb-tags");
    var qfb_tag_status = qfb_tag.checked;
    if (!qfb_tag_status) 
    {
	    qfb_tag.click();
    }
    
    //get all the tags existing in thunderbird.
    var allTags = follow_up_ext.tagService.getAllTags({});

	//set timeout for the UI elements to load.
    setTimeout(
        function ()
        {
        	//check all the pending tags and set their toggle state to true.
            for (var i = 0; i < allTags.length; i++)
            {
                var tagname = allTags[i].tag;
                var initial = tagname.substring(0, 10);
                if (initial == "Pending Si") 
                {
                    pending_count++;
                    var tagButton = document.getElementById("qfb-tag-" + allTags[i].key);
                    tagButton.click();
                }
            }
            //if no pending tags found then we just display a popup message.
            if (pending_count == 0) 
            {
                var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
                promptService.alert(null, "Follow Up", "You have no pending mails!");
                //reset the qfb state.
                if (!qfb_tag_status)
                {
                    qfb_tag.click(); 
                }
                if (!qfb_status) 
                {
                    qfb.click();
                }
            }
        }, 1000)
  },
  
  /*
  This function shows all the follow-up and the pending mails together
  using the Thunderbird Quick Filter Bar.
  */
  showAll : function()
  {
  	var all_count = 0;
    
    var qfb = document.getElementById("qfb-show-filter-bar");
    var qfb_status = qfb.checked;
    if (!qfb_status)
    {
    	qfb.click();
    }
    
    var qfb_tag = document.getElementById("qfb-tags");
    var qfb_tag_status = qfb_tag.checked;
    if (!qfb_tag_status)
    {
    	qfb_tag.click();
    }
    
    //get all tags existing in thnderbird.
    var allTags = follow_up_ext.tagService.getAllTags({});

    //set timeout to allow the UI elements to load.     
    setTimeout(
        function ()
        {
            for (var i = 0; i < allTags.length; i++) 
            {
                var tagname = allTags[i].tag;
                var initial = tagname.substring(0, 10);
                //if a follow up or pending tag exists set its toggled state to true.
                if (initial == "Pending Si" || initial == "Follow Up:")
                {
                    all_count++;
                    var tagButton = document.getElementById("qfb-tag-" + allTags[i].key);
                    tagButton.click();
                }
            }
            //if no tags are found simply display a message.
            if (all_count == 0)
            {
                var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
                promptService.alert(null, "Follow Up", "You have no pending / follow up mails!");
                if (!qfb_tag_status) 
                {
                    qfb_tag.click();
                }
                if (!qfb_status)
                {
                    qfb.click();
                }
            }
        }, 1000)
  },
  
  /*This funtion finds the key of the tag whose name is passed to it*/
  findTagKey : function(tagName) 
  {
  	var res = null;
    var allTags = follow_up_ext.tagService.getAllTags({});
    for (var i = 0; i < allTags.length; i++) 
    {
    	if (allTags[i].tag == tagName) 
        {
            res = allTags[i].key;
            break;
        }
    }
    return res;
  },
  
  /*This function checks for all flags that are overdue and changes them to pending*/
  setPendingTags : function()
  {
  	var allTags = follow_up_ext.tagService.getAllTags({});
    for (var i = 0; i < allTags.length; i++) 
    {
        var tagname = allTags[i].tag;
        var initial = tagname.substring(0, 10);
        if (initial == "Follow Up:") 
        {
            if (follow_up_ext.compareWithToday(tagname.substring(11)) == true) 
            {
                key = allTags[i].key;
                follow_up_ext.tagService.setTagForKey(key, "Pending Since: " + tagname.substring(11));
                follow_up_ext.tagService.setColorForKey(key, "#FF0000");
            }
        }
    }
  },
  
  /*This function clears unused follow-up / pending tags that are no longer attached to any emails*/
  clearUnusedTags : function() 
  {
  	var qfb = document.getElementById("qfb-show-filter-bar");
    var qfb_status = qfb.checked;
    if (!qfb_status) 
    {
        qfb.click();
    }

    var qfb_tag = document.getElementById("qfb-tags");
    var qfb_tag_status = qfb_tag.checked;
    if (!qfb_tag_status) 
    {
        qfb_tag.click();
    }

	//set timeout to load the UI elements.
    setTimeout(

    function () 
    {
        var allTags = follow_up_ext.tagService.getAllTags({});
        var key;
        for (var i = 0; i < allTags.length; i++)
        {
            var tagname = allTags[i].tag;
            var initial = tagname.substring(0, 10);
            if (initial == "Follow Up:" || initial == "Pending Si") 
            {
                key = allTags[i].key;
                var tagButton = document.getElementById("qfb-tag-" + key);
                if (tagButton == null)
                {
                    follow_up_ext.tagService.deleteKey(key);
                }
            }
        }
        if (!qfb_tag_status)
        {
            qfb_tag.click();
        }
        if (!qfb_status) 
        {
            qfb.click();
        }
    }, 1000)
  },
  
  /*This functions checks if the date is older than todays date and returns true if it is so*/
  compareWithToday : function(dateRef) 
  {
  	var arr = dateRef.split("/");
    var date = new Date();

    if (date.getFullYear() > parseInt(arr[2])) {
        return true;
    }
    if (date.getMonth() > parseInt(arr[1])) {
        return true;
    }
    if (date.getDate() > parseInt(arr[0])) {
        return true;
    }
    return false;
  },
};



follow_up_tb = { 
	/*Code for the click of the follow-up button. It calls the datepicker window, creates / adds the tag to the email*/
    1: function () 
    {
    	follow_up_ext.addFollowUp();
    },

    /*This is the mark as done function. It marks done ALL the follow up tags set for that email. it also calls the remove unused tag function*/
    2: function ()
    {
    	follow_up_ext.markDone();
    },
    /*This is the function on the View today click.*/
    3: function () 
    {
        var date = new Date();
        follow_up_ext.viewFollowUp(date);
    },
    /*This is the function on the View Pending click.*/
    4: function () 
    {
    	follow_up_ext.viewPending();
    },
    /*This function shows the preference window when the options menu is clicked*/
    5: function () 
    {
        window.openDialog("chrome://follow_up_ext/content/options.xul", "", "window", null).focus();
    },
    /*This function shows all the pending and the mails to follow up*/
    6: function ()
    {
    	follow_up_ext.showAll();
    },

};   
window.addEventListener("load", function () { follow_up_ext.onLoad(); }, false);