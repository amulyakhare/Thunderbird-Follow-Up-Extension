var follow_up_calendar = {

init : function()
{
	this.calendarManager = Components.classes["@mozilla.org/calendar/manager;1"].getService(Components.interfaces.calICalendarManager);
	var calendars = this.calendarManager.getCalendars({});
	
	var calName = follow_up_ext.prefs.getCharPref("extensions.follow_up_ext.calname");
	if(calName != "")
	{
		for(i=0;i<calendars.length;i++)
		{
			//assumes unique calendar name
			if(calName == calendars[i].name)
			{
				this.calendar = calendars[i];
			}
		}
	}
	this.PENDING = "Pending";
	this.FOLLOWUP = "Follow Up";
},

addFollowUpCalendar : function()
{
	var ioSvc = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
    var temp = this.calendarManager.createCalendar("storage",ioSvc.newURI("moz-profile-calendar://", null, null));
    temp.name = "Follow-Up";
	this.calendarManager.registerCalendar(temp);
	follow_up_ext.prefs.setCharPref("extensions.follow_up_ext.calname",temp.name);
	this.calendar = temp;
},

dateToStr : function(date)
{
	//get the year.
	var year = date.getFullYear();
    //get the month.
    var month = date.getMonth()+1;
    month += "";
    if (month.length == 1)
    {
        month = "0"+month;
    }
    //get the date.
    var day = date.getDate();
    day += "";
    if (day.length == 1) 
    {
        day = "0"+day;
    }
    //combine into a string.
    var dateStr = year + "" + month + "" + day;
    return dateStr;
},

removeEvent:function(date,status)
{   
    var dateStr = this.dateToStr(date);

    //retrieve the event from the calendar by using its id.
    var id= status + dateStr;
    var tempEvent = this.retrieveItem(id, this.calendar);
    //if no event found then just return.
    if(tempEvent != null)
    {
    	this.modifyCalendarEvent(tempEvent,-1,status);
    }
    
    return; 
},

removeTask:function(date,status)
{
    var dateStr = this.dateToStr(date);

    //retrieve the event from the calendar by using its id.
    var id= status + dateStr;
    var tempTask = this.retrieveItem(id, this.calendar);
    //if no event found then just return.
    if(tempTask != null)
    {
    	this.modifyCalendarTask(tempTask,-1,status);
    }
    return;    
},

retrieveItem: function(id,calendar)
{
    var listener = new follow_up_calendar.calOpListener();    
    calendar.getItem(id, listener);
    return listener.mItems[0];
},

setEventToPending : function(date)
{
	var dateStr = this.dateToStr(date);
	var id = this.FOLLOWUP + dateStr;
	var tempEvent =  this.retrieveItem(id,this.calendar);
    
    //if such an event is found then we need to modify the existing one to accomodate the title change.
    if(tempEvent != null)
    {
    	var newEvent = Components.classes["@mozilla.org/calendar/event;1"].createInstance(Components.interfaces.calIEvent);
   		newEvent.icalString = tempEvent.icalString;
    	newEvent.calendar = this.calendar;
    	newEvent.title = this.PENDING + ": "+ tempEvent.title.substring(11);
    	newEvent.id = this.PENDING + dateStr;
    	this.calendar.modifyItem(newEvent,tempEvent,null);
    }
},

setTaskToPending : function(date)
{
	var dateStr = this.dateToStr(date);
	var id = this.FOLLOWUP + dateStr;
	var tempTask =  this.retrieveItem(id,this.calendar);
    
    //if such an event is found then we need to modify the existing one to accomodate the title change.
    if(tempTask != null)
    {
    	var newTask = Components.classes["@mozilla.org/calendar/todo;1"].createInstance(Components.interfaces.calITodo);
   		newTask.icalString = tempTask.icalString;
    	newTask.calendar = this.calendar;
    	newTask.title = this.PENDING + ": "+ tempTask.title.substring(11);
    	newTask.id = this.PENDING + dateStr;
    	this.calendar.modifyItem(newTask,tempTask,null);
    }
},

addEvent : function(date,status)
{
	var dateStr = this.dateToStr(date);
	
	//get the event by using its id.
    var id= status + dateStr;
    var tempEvent =  this.retrieveItem(id,this.calendar);

    //if such an event is found then we need to modify the existing one to accomodate the title change.
    if(tempEvent != null)
    {	
    	this.modifyCalendarEvent(tempEvent,1,status);
    	return;
    }
    // Strategy is to create iCalString and create Event from that string
    var iCalString = "BEGIN:VCALENDAR\n";
    iCalString += "BEGIN:VEVENT\n";
    iCalString += "SUMMARY:Test2345\n";
		   
    // generate Date as Ical compatible text string
    iCalString += "DTSTART;VALUE=DATE:" + dateStr + "\n";	    
               	   
    // set Duration
    iCalString += "DURATION=PT1D\n";
		   
    // set Alarm
    iCalString += "BEGIN:VALARM\nACTION:DISPLAY\nTRIGGER:-PT" + "1" + "M\nEND:VALARM\n";
    
    // finalize iCalString
    iCalString += "END:VEVENT\n";
    iCalString += "END:VCALENDAR\n";

    // create event Object out of iCalString
    var event = Components.classes["@mozilla.org/calendar/event;1"].createInstance(Components.interfaces.calIEvent);	
    event.icalString = iCalString;

    // set Title (Summary) 					  		   
    event.title = status + ": 1 Email";
		
    // set ID
    event.id=id;
    
    // add Item to Calendar
    this.calendar.addItem(event, null);
},

modifyCalendarEvent : function(tempEvent,unit,status)
{
	var count;
	if(status == this.PENDING)
	{
		count = parseInt(tempEvent.title.substring(9,10));
	}
	else
	{
		count = parseInt(tempEvent.title.substring(11,12));
    }
    var newEvent = Components.classes["@mozilla.org/calendar/event;1"].createInstance(Components.interfaces.calIEvent);
    newEvent.icalString = tempEvent.icalString;
    newEvent.calendar = this.calendar;
    count = count + unit;
    //if this was the only follow up the it must be deleted.
    if(count == 0)
    {
        this.calendar.deleteItem(newEvent,null);
    }
    //if 1 follow up remains then change text to singular "Email".
    else if(count == 1)
    {
        newEvent.title = status + ": "+ count +" Email";
        this.calendar.modifyItem(newEvent,tempEvent,null);
    }
    //if more that one follow ups remain then only the title needs to be changed.
    else
    {
        newEvent.title = status + ": "+ count +" Emails";
    	this.calendar.modifyItem(newEvent,tempEvent,null);
    }
    return;
},

modifyCalendarTask : function(tempTask,unit,status)
{
	var count;
	if(status == this.PENDING)
	{
		count = parseInt(tempTask.title.substring(9,10));
	}
	else
	{
		count = parseInt(tempTask.title.substring(11,12));
    }
    var newTask = Components.classes["@mozilla.org/calendar/todo;1"].createInstance(Components.interfaces.calITodo);
    newTask.icalString = tempTask.icalString;
    newTask.calendar = this.calendar;
    count = count + unit;
    //if this was the only follow up the it must be deleted.
    if(count == 0)
    {
        this.calendar.deleteItem(tempTask,null);
    }
    //if 1 follow up remains then change text to singular "Email".
    else if(count == 1)
    {
        newTask.title = status + ": "+ count +" Email";
        this.calendar.modifyItem(newTask,tempTask,null);
    }
    //if more that one follow ups remain then only the title needs to be changed.
    else
    {
        newTask.title = status + ": "+ count +" Emails";
    	this.calendar.modifyItem(newTask,tempTask,null);
    }
    return;
},


addTask : function(date,status)
{
	var dateStr = this.dateToStr(date);
	var id= status + dateStr;
	
	var tempTask =  this.retrieveItem(id,this.calendar);
    
    //if a task exists.
    if(tempTask != null)
    {
    	this.modifyCalendarTask(tempTask,1,status);
    	return;
    }
    
     // Strategy is to create iCalString and create task from that string
    var iCalString = "BEGIN:VCALENDAR\n";
    iCalString += "BEGIN:VTODO\n";
    iCalString += "SUMMARY:Test2345\n";
		   
    // generate Date as Ical compatible text string
    iCalString += "DTSTART;VALUE=DATE:" + dateStr + "\n";
    iCalString += "DUE;VALUE=DATE:" + dateStr + "\n";	
		   
    // set Alarm
    iCalString += "BEGIN:VALARM\nACTION:DISPLAY\nTRIGGER:-PT" + "1" + "M\nEND:VALARM\n";
    
    // finalize iCalString
    iCalString += "END:VTODO\n";
    iCalString += "END:VCALENDAR\n";

    // create event Object out of iCalString
    var task = Components.classes["@mozilla.org/calendar/todo;1"].createInstance(Components.interfaces.calITodo);	
    task.icalString = iCalString;

    // set Title (Summary) 					  		   
    task.title = status + ": 1 Email";
		
    // set ID
    task.id=id;
        
    // add Item to Calendar
    this.calendar.addItem(task, null);
},

createNewTask:function(date)
{
    var calendarManager = Components.classes["@mozilla.org/calendar/manager;1"].getService(Components.interfaces.calICalendarManager);
    
    var calendars = calendarManager.getCalendars({});
    var calendar = calendars[0];
    
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    month += "";
    if (month.length == 1)
    {
        month = "0"+month;
    }
    var day = date.getDate();
    day += "";
    if (day.length == 1) 
    {
        day = "0"+day;
    }
    var dateStr = year + "" + month + "" + day;	
    
    var id= "Follow Up" + dateStr;
    
    //var listener = new follow_up_calendar.calOpListener();
		
    //alert(id+" searching");
    var tempEvent =  this.retrieveItem(id,calendar);
    
    if(tempEvent != null)
    {
        var count = parseInt(tempEvent.title.substring(11,12));
        var newEvent = Components.classes["@mozilla.org/calendar/todo;1"].createInstance(Components.interfaces.calITodo);
        newEvent.icalString = tempEvent.icalString;
        count += 1;
        newEvent.title = "Follow Up: "+ count +" Emails";
        calendar.modifyItem(newEvent,tempEvent,null);
        return;
    }
        
    // Strategy is to create iCalString and create Event from that string
    var iCalString = "BEGIN:VCALENDAR\n";
    iCalString += "BEGIN:VTODO\n";
    iCalString += "SUMMARY:Test2345\n";
		   
    // generate Date as Ical compatible text string
    iCalString += "DTSTART;VALUE=DATE:" + dateStr + "\n";
    iCalString += "DUE;VALUE=DATE:" + dateStr + "\n";	
    
    //alert(dateStr);       
               	   
    // set Duration
    //iCalString += "DURATION=PT1D\n";
		   
    // set Alarm
    iCalString += "BEGIN:VALARM\nACTION:DISPLAY\nTRIGGER:-PT" + "1" + "M\nEND:VALARM\n";
    
    // finalize iCalString
    iCalString += "END:VTODO\n";
    iCalString += "END:VCALENDAR\n";
 		   
    //alert(iCalString);

    // create event Object out of iCalString
    var event = Components.classes["@mozilla.org/calendar/todo;1"].createInstance(Components.interfaces.calITodo);	
    event.icalString = iCalString;

    // set Title (Summary) 					  		   
    event.title = "Follow Up: 1 Email";
		
    // set ID
    event.id=id;
        
    // add Item to Calendar
    calendar.addItem(event, null);
},
};
follow_up_calendar.calOpListener = function () 
{
}
follow_up_calendar.calOpListener.prototype = {
      mItems: [],
      mDetail: null,
      mId: null,
      mStatus: null,
        
      onOperationComplete: function(aCalendar, aStatus, aOperationType, aId, aDetail) {
         // stopEventPump();
         this.mDetail = aDetail;
         this.mStatus = aStatus;
         this.mId = aId;
         /*if (this.mItems.length)
         {
         	this.mItems[0].calendar = aCalendar;
         }*/
         // XXX verify aCalendar == cal
         //  done = true;
         return;
      },
        
      onGetResult: function(aCalendar, aStatus, aItemType, aDetail, aCount, aItems) {
        
         // XXX check success(?); dump un-returned data,
         this.mItems = aItems;
         return;
      }
   }