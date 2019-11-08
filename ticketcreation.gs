var JIRA_INSTANCE = <YOUR_JIRA_INSTANCE_NAME>
var PROJECT_KEY = <YOUR_PROJECT_KEY>
var URL = 'https://'+JIRA_INSTANCE+'.atlassian.net/rest/api/2/issue'
var CREATED_STATUS = 'created' // we will used this field to prevent creating a duplicated ticket
var REQUESTER_EMAIL = <EMAIL_THAT_WILL_BE_USED_TO_SEND_THE_TICKET_URL>
var SQUAD = <YOUR_SQUAD_NAME>
var COLUMN_TICKET_URL = 'L' // this value is based on the arrangement of columns in the spreadsheet
var COLUMN_TICKET_STATUS = 'M'// this value is based on the arrangement of columns in the spreadsheet

function createIssue()
{
  var activeSheet = SpreadsheetApp.getActiveSheet()
  var rows = activeSheet.getDataRange().getValues()
  
  for (var i = 1; i < rows.length; i++) {
    if(rows[i][12] != CREATED_STATUS){
      createTicket(rows[i],i+1)
    }
  }
}

function createTicket(row, position){
  Logger.log("Row: " + row)
  var userName = row[0] //A
  var summary = row[1] //B
  var squad = row[2]//C
  var bugDescription = row[3]//D
  var print = row[4]//E
  var expected= row[5];//F
  var type = row[6]//G
  var priority= row[7];//H
  var category= row[8];//I
  var appVersion= row[9];//J
  var platform= row[10];//K
  var ticketUrl= row[11];//L
  var ticketStatus= row[12];//M
   var ticketData = 
  {
    "fields": {
      "project":{ 
        "key": PROJECT_KEY
      },
      "priority": {
        "name": priority
      },
      "issuetype":{
        "name": type
      },
      "summary": summary,
      "description": bugDescription + "\n\nExpected: "+expected + "\n\nPrints: " +print,
      "components": [{ "name": platform}],
      "reporter": {"name": userName},
      "versions": [{"name": appVersion}],
      // The following custom fields are for the various strings and are simple text fields in JIRA
      // You can find all the custom fields by looking here: https://<YOUR_JIRA_INSTANCE>.atlassian.net/rest/api/latest/field/
      // Best way to find all fields supported in a ticket is looking here: https://rwondemand.atlassian.net/rest/api/3/issue/<ticket_id>
      "customfield_13503": {"value": CONSUMER_SQUAD}
     }
  }
  
  var payload = JSON.stringify(ticketData)
  Logger.log("ticketDate: " + payload)

  var headers = {
    "content-type": "application/json",
    "Accept": "application/json",
    "authorization":<BASIC_AUTH> // Base64 encoded 
  }
  var options = { 
    "content-type": "application/json",
    "method": "POST",
    "headers": headers,
    "payload": payload
   } 
  
  Logger.log("Options: " + JSON.stringify(options))
  // Make the HTTP call to the JIRA API
  var response = UrlFetchApp.fetch(URL, options)
  Logger.log(response.getContentText())
  var dataAll = JSON.parse(response.getContentText())
  var issueKey = dataAll.key
  
  changeColumn('https://'+JIRA_INSTANCE+'.atlassian.net/browse/'+ issueKey, COLUMN_TICKET_URL+position)
  changeColumn(CREATED_STATUS,COLUMN_TICKET_STATUS+position)
  sendEmail(issueKey)
}

function changeColumn(value,position){
  SpreadsheetApp.getActiveSheet().getRange(position).setValue(value) 
}

function sendEmail(issueKey){
  var title= 'Bugbash ticket created: '+issueKey
  var message = 'Seu ticket foi criado. O ticket ' + issueKey + ' pode ser acesso através do link:' + '\n\n' +
      'https://'+JIRA_INSTANCE+'.atlassian.net/browse/'+ issueKey + '\n\n'
  MailApp.sendEmail(REQUESTER_EMAIL, title, message) 
}
