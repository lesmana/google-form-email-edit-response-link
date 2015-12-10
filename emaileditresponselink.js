/*
This program is free software. It comes without any warranty, to
the extent permitted by applicable law. You can redistribute it
and/or modify it under the terms of the Do What The Fuck You Want
To Public License, Version 2, as published by Sam Hocevar. See
http://www.wtfpl.net/ for more details.
*/

function onOpen() {
  var form = FormApp.getActiveForm();
  ScriptApp.newTrigger('emailConfirmationToRespondent')
      .forForm(form)
      .onFormSubmit()
      .create();
}

function processTitleResponse(formResponse) {
  var respondentEmail = '';
  var emailBodyList = [];
  var itemResponses = formResponse.getItemResponses();
  for (var i = 0; i < itemResponses.length; i++) {
    var itemResponse = itemResponses[i];
    var title = itemResponse.getItem().getTitle();
    var response = itemResponse.getResponse();
    if (title == 'Email') {
      respondentEmail = response
    }
    emailBodyList.push(title, ':\n', response, '\n\n');
  }
  var emailBody = emailBodyList.join('');
  return {
    respondentEmail: respondentEmail,
    emailBody: emailBody,
  };
}

function collectData(form, formResponse) {
  var data = {}
  data.formTitle = form.getTitle();
  var titleResponseResult = processTitleResponse(formResponse);
  var editResponseUrl = formResponse.getEditResponseUrl();
  data.emailBody = [
    titleResponseResult.emailBody,
    'edit link:\n', editResponseUrl, '\n'
  ].join('');
  data.respondentEmail = titleResponseResult.respondentEmail;
  data.effectiveUserEmail = Session.getEffectiveUser().getEmail();
  return data
}

function emailRespondent(data) {
  var recipient = data.respondentEmail;
  var subject = ['Your response: ', data.formTitle].join('');
  var body = data.emailBody;
  MailApp.sendEmail(recipient, subject, body);
}

function emailFormCreator(data) {
  var recipient = data.effectiveUserEmail;
  var subject = ['Response: ', data.formTitle].join('');
  var body = [
    'someone responded to the form: ', data.formTitle, '\n',
    '\n',
    'they were sent this email:\n',
    '\n',
    data.emailBody
  ].join('');
  MailApp.sendEmail(recipient, subject, body);
}

function emailConfirmationToRespondent(e) {
  var form = e.source;
  var formResponse = e.response;
  var data = collectData(form, formResponse);
  emailRespondent(data);
  emailFormCreator(data);
}

