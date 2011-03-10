var LightningEvent = {
removeAnEvent:function(date)
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
    var newEvent = Components.classes["@mozilla.org/calendar/event;1"].createInstance(Components.interfaces.calIEvent);
    newEvent.icalString = tempEvent.icalString;
    count -= 1;
    if(count == 0)
    {
        calendar.deleteItem(newEvent,null);
    }
    else if(count == 1)
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
    var listener = new LightningEvent.calOpListener();
    
    calendar.getItem(id, listener);
    
    return listener.mItems[0];
    
},
createNewEvent:function(date)
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
    
    //var listener = new LightningEvent.calOpListener();
		
    //alert(id+" searching");
    var tempEvent =  this.retrieveEvent(id,calendar);
    
    if(tempEvent != null)
    {
        var count = parseInt(tempEvent.title.substring(11,12));
        var newEvent = Components.classes["@mozilla.org/calendar/event;1"].createInstance(Components.interfaces.calIEvent);
        newEvent.icalString = tempEvent.icalString;
        count += 1;
        newEvent.title = "Follow Up: "+ count +" Emails";
        calendar.modifyItem(newEvent,tempEvent,null);
        return;
    }
        
    // Strategy is to create iCalString and create Event from that string
    var iCalString = "BEGIN:VCALENDAR\n";
    iCalString += "BEGIN:VEVENT\n";
    iCalString += "SUMMARY:Test2345\n";
		   
    // generate Date as Ical compatible text string
    iCalString += "DTSTART;VALUE=DATE:" + dateStr + "\n";	
    
    //alert(dateStr);       
               	   
    // set Duration
    iCalString += "DURATION=PT1D\n";
		   
    // set Alarm
    iCalString += "BEGIN:VALARM\nACTION:DISPLAY\nTRIGGER:-PT" + "1" + "M\nEND:VALARM\n";
    
    // finalize iCalString
    iCalString += "END:VEVENT\n";
    iCalString += "END:VCALENDAR\n";
 		   
    //alert(iCalString);

    // create event Object out of iCalString
    var event = Components.classes["@mozilla.org/calendar/event;1"].createInstance(Components.interfaces.calIEvent);	
    event.icalString = iCalString;

    // set Title (Summary) 					  		   
    event.title = "Follow Up: 1 Email";
		
    // set ID
    event.id=id;
        
    // add Item to Calendar
    calendar.addItem(event, null);
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
    
    //var listener = new LightningEvent.calOpListener();
		
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
LightningEvent.calOpListener = function () 
{
}
LightningEvent.calOpListener.prototype = {
      mItems: [],
      mDetail: null,
      mId: null,
      mStatus: null,
        
      onOperationComplete: function(aCalendar, aStatus, aOperationType, aId, aDetail) {
         // stopEventPump();
         this.mDetail = aDetail;
         this.mStatus = aStatus;
         this.mId = aId;
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