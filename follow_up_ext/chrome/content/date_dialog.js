function insertDatepicker() {
    let aWeekStartPref;
    try {
        var prefService = Components.classes["@mozilla.org/preferences-service;1"]
                                    .getService(Components.interfaces.nsIPrefBranch);
        aWeekStartPref = prefService.getIntPref("calendar.week.start");
    }
    catch (ex) {
    }
    let aGroupbox = document.getElementById("datepickerGroupbox");
    let aDatepicker = document.createElement("datepicker");
    aDatepicker.setAttribute("id", "selDate");
    aDatepicker.setAttribute("type", "grid");
    aDatepicker.setAttribute("firstdayofweek", aWeekStartPref);
    aGroupbox.appendChild(aDatepicker);
}

var follow_up_datedialog = {
doOK : function()
{
  window.arguments[0].out = document.getElementById("selDate").dateValue;
  return true;
},

doCancel : function()
{
  return true;
},
};