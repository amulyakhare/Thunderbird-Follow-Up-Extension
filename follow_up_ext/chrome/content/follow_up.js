var follow_up_ext = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("follow_up_ext-strings");
    this.prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    this.tagService = Components.classes["@mozilla.org/messenger/tagservice;1"].getService (Components.interfaces.nsIMsgTagService);
    //set overdue tags to pending on extension load
    setPendingTags();
    setTimeout
    (
        function()
        {
            clearUnusedTags();
        },
        1000
    )
  },

  onMenuItemCommand: function(e) {
  },

  onToolbarButtonCommand: function(e) {
    follow_up_ext.onMenuItemCommand(e);
  }
};

window.addEventListener("load", function () { follow_up_ext.onLoad(); }, false);

CustomButton = {
/*Code for the click of the follow-up button. It calls the datepicker window, creates / adds the tag to the email*/
1: function () 
{
    var params = {out:null};
    window.openDialog("chrome://follow_up_ext/content/date_dialog.xul","","modal",params).focus();
    if (params.out != null)
    {
        var date = params.out;
        //create the tagname
        var d= "Follow Up: " +date.getDate().toString() +"/"+ (date.getMonth()+1) +"/"+ date.getFullYear().toString();
        if(!follow_up_ext.tagService.getKeyForTag(d))
        {
            follow_up_ext.tagService.addTag (d, "#33CC00", "");
        }
        ToggleMessageTag (findTagKey(d), true);
    }
},
    
/*This is the mark as done function. It marks done ALL the follow up tags set for that email. it also calls the remove unused tag function*/ 
2: function () 
{
    var allTags = follow_up_ext.tagService.getAllTags ({});
    
    for (var i = 0; i < allTags.length; i++) 
    {
        var tagname = allTags[i].tag;
        
        //check if it is a follow up or pending tag.
        var initial = tagname.substring(0,10);
        if (initial == "Follow Up:" || initial == "Pending Si")
        {
            key = allTags [i].key;
            
            var msgHdr = gDBView.hdrForFirstSelectedMessage;
            var curKeys = msgHdr.getStringProperty ("keywords"); 
            if (curKeys.indexOf (key) != -1)
            {
                //message has tag
                var dateString = allTags[i].tag.substring(11).split("/");
                var month = parseInt(dateString[1]) - 1;
                var date = new Date(dateString[2],month,dateString[0]);
                ToggleMessageTag (key, false);
            }
        }
    }
},
/*This is the function on the View today click. Basically makes use of the thunderbird 3 quickfilterbar to show the appopriate emails.*/    
3: function () 
{
    var date = new Date();
    var d= "Follow Up: " +date.getDate().toString() +"/"+ (date.getMonth()+1) +"/"+ date.getFullYear().toString();
    var key = findTagKey(d);
    
    var qfb = document.getElementById("qfb-show-filter-bar");
    var qfb_status = qfb.checked;
    if(!qfb_status)
    {
        qfb.click();
    }
    
    var qfb_tag = document.getElementById("qfb-tags");
    var qfb_tag_status = qfb_tag.checked;
    if(!qfb_tag_status)
    {
        qfb_tag.click();
    }
    
    setTimeout
    (
        function()
        {
            var tagButton = document.getElementById("qfb-tag-"+key);
            //if no such tag element is found.
            if(tagButton == null)
            {
                var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
                promptService.alert(null,"Follow Up", "You have no mails to follow up!");
                if(!qfb_tag_status)
                {
                    qfb_tag.click();
                }
                if(!qfb_status)
                {
                    qfb.click();
                }
            }
            //reset the button state
            tagButton.click();
        },
        1000
    )
},
/*This is the function on the View Pending click. Basically makes use of the thunderbird 3 quickfilterbar to show the appopriate emails.*/
4: function () 
{
    var pending_count= 0;
    var qfb = document.getElementById("qfb-show-filter-bar");
    var qfb_status = qfb.checked;
    if(!qfb_status)
    {
        qfb.click();
    }
    
    var qfb_tag = document.getElementById("qfb-tags");
    var qfb_tag_status = qfb_tag.checked;
    if(!qfb_tag_status)
    {
        qfb_tag.click();
    }
    var allTags = follow_up_ext.tagService.getAllTags ({});
    
    setTimeout
    (
        function()
        {
            for (var i = 0; i < allTags.length; i++) 
            {
                var tagname = allTags[i].tag;
                var initial = tagname.substring(0,10);
                if (initial == "Pending Si")
                {
                    pending_count++;
                    var tagButton = document.getElementById("qfb-tag-"+allTags[i].key);
                    tagButton.click();
                }
            }
            if(pending_count == 0)
                {
                    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
                    promptService.alert(null,"Follow Up", "You have no pending mails!");
                    if(!qfb_tag_status)
                    {
                        qfb_tag.click();
                    }
                    if(!qfb_status)
                    {
                        qfb.click();
                    }
                }
        },
        1000
    )
},
/*This function shows the preference window when the options menu is clicked*/
5: function () 
{
    window.openDialog("chrome://follow_up_ext/content/options.xul","","window",null).focus();
}

};
/*This funtion finds the key of the tag whose name is passed to it*/
function findTagKey(tagName)
{
    var res = null;
	var allTags = follow_up_ext.tagService. getAllTags ({});
	for (var i = 0; i < allTags. length; i++)
	{
		if (allTags [i]. tag == tagName)
		{
			res = allTags [i]. key;
			break;
		}
	}
    return res;
}
/*This function checks for all flags that are overdue and changes them to pending*/
function setPendingTags()
{
    var allTags = follow_up_ext.tagService.getAllTags ({});
    for (var i = 0; i < allTags.length; i++) 
    {
        var tagname = allTags[i].tag;
        var initial = tagname.substring(0,10);
        if (initial == "Follow Up:")
        {
            if(compareWithToday(tagname.substring(11)) == true)
            {
                key = allTags[i].key;
                follow_up_ext.tagService.setTagForKey(key,"Pending Since: "+tagname.substring(11));
                follow_up_ext.tagService.setColorForKey(key,"#FF0000");
            }
        }
    }
}
/*This function clears unused follow-up / pending tags that are no longer attached to any emails*/
function clearUnusedTags()
{
    var qfb = document.getElementById("qfb-show-filter-bar");
    var qfb_status = qfb.checked;
    if(!qfb_status)
    {
        qfb.click();
    }
    
    var qfb_tag = document.getElementById("qfb-tags");
    var qfb_tag_status = qfb_tag.checked;
    if(!qfb_tag_status)
    {
        qfb_tag.click();
    }
    
    setTimeout
    (
        function()
        {
            var allTags = follow_up_ext.tagService. getAllTags ({});
            var key;
            for (var i = 0; i < allTags. length; i++)
            {
                var tagname = allTags[i].tag;
                var initial = tagname.substring(0,10);
                if (initial == "Follow Up:" || initial == "Pending Si")
                {
                    key = allTags [i]. key;
                    var tagButton = document.getElementById("qfb-tag-"+key);
                    if(tagButton == null)
                    {
                        follow_up_ext.tagService.deleteKey(key);
                    }
                }
            }
            if(!qfb_tag_status)
            {
                qfb_tag.click();
            }
            if(!qfb_status)
            {
                qfb.click();
            }
        },
        1000
    )
}
/*This functions checks if the date is older than todays date and returns true if it is so*/
function compareWithToday(dateRef)
{
    var arr = dateRef.split("/");
    var date = new Date();
    
    if(date.getFullYear() > parseInt(arr[2]))
    {
        return true;
    }
    if(date.getMonth() > parseInt(arr[1]))
    {
        return true;
    }
    if(date.getDate() > parseInt(arr[0]))
    {
        return true;
    }
    return false;
}