var follow_up_calendar = {

init : function()
{
	this.calendarManager = Components.classes["@mozilla.org/calendar/manager;1"].getService(Components.interfaces.calICalendarManager);
	var calendars = this.calendarManager.getCalendars({});
	this.calendar = calendars[0];
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

removeAnEvent:function(date)
{   
    var dateStr = this.dateToStr(date);
    
    //retrieve the event from the calendar by using its id.
    var id= "Follow Up" + dateStr;
    var tempEvent = this.retrieveEvent(id, this.calendar);
    //if no event found then just return.
    if(tempEvent == null)
    {
        return;
    }
    
    //else check the follow up count
    var count = parseInt(tempEvent.title.substring(11,12));
    var newEvent = Components.classes["@mozilla.org/calendar/event;1"].createInstance(Components.interfaces.calIEvent);
    newEvent.calendar = this.calendar;
    newEvent.icalString = tempEvent.icalString;
    count -= 1;
    //if this was the only follow up the it must be deleted.
    if(count == 0)
    {
        this.calendar.deleteItem(newEvent,null);
    }
    //if 1 follow up remains then change text to singular "Email".
    else if(count == 1)
    {
        newEvent.title = "Follow Up: "+ count +" Email";
        this.calendar.modifyItem(newEvent,tempEvent,null);
    }
    //if more that one follow ups remain then only the title needs to be changed.
    else
    {
        newEvent.title = "Follow Up: "+ count +" Emails";
        this.calendar.modifyItem(newEvent,tempEvent,null);
    }
    return; 
},
removeATask:function(date)
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
    
    var tempEvent = this.retrieveEvent(id, calendar);
    
    if(tempEvent == null)
    {
        return;
    }
    var count = parseInt(tempEvent.title.substring(11,12));
    count -= 1;
    if(count == 0)
    {
        calendar.deleteItem(tempEvent,null);
        return;
    }

    var newEvent = Components.classes["@mozilla.org/calendar/todo;1"].createInstance(Components.interfaces.calITodo);
    newEvent.icalString = tempEvent.icalString;
    
    if(count == 1)
    {
        newEvent.title = "Follow Up: "+ count +" Email";
        calendar.modifyItem(newEvent,tempEvent,null);
    }
    else
    {
        newEvent.title = "Follow Up: "+ count +" Emails";
        calendar.modifyItem(newEvent,tempEvent,null);
    }
    return;
    
},

retrieveEvent: function(id,calendar)
{
    var listener = new follow_up_calendar.calOpListener();    
    calendar.getItem(id, listener);
    return listener.mItems[0];
},

createNewEvent:function(date)
{
    var dateStr = this.dateToStr(date);
    
    //get the event by using its id.
    var id= "Follow Up" + dateStr;
    var tempEvent =  this.retrieveEvent(id,this.calendar);
    
    //if such an event is found then we need to modify the existing one to accomodate the title change.
    if(tempEvent != null)
    {
        var count = parseInt(tempEvent.title.substring(11,12));
        var newEvent = Components.classes["@mozilla.org/calendar/event;1"].createInstance(Components.interfaces.calIEvent);
        newEvent.icalString = tempEvent.icalString;
        count += 1;
        newEvent.title = "Follow Up: "+ count +" Emails";
        newEvent.calendar = this.calendar;
        this.calendar.modifyItem(newEvent,tempEvent,null);
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
    event.title = "Follow Up: 1 Email";
		
    // set ID
    event.id=id;
        
    // add Item to Calendar
    this.calendar.addItem(event, null);
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
    var tempEvent =  this.retrieveEvent(id,calendar);
    
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