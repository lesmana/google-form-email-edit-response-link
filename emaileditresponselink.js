/*
Copyright 2015 Lesmana Zimmer

This program is free software. It comes without any warranty, to
the extent permitted by applicable law. You can redistribute it
and/or modify it under the terms of the Do What The Fuck You Want
To Public License, Version 2, as published by Sam Hocevar. See
http://www.wtfpl.net/ for more details.
*/

/*
google form script to email response and edit link to creator and respondent.

https://github.com/lesmana/google-form-email-edit-response-link

this script is meant to be attached to a google form.

furthermore it should be attached to a on form submit trigger.

it will send an email to the form creator and to the respondent
for every form response submitted.
*/

function collectFormData(form) {
  var formTitle = form.getTitle();
  var formData = {
    formTitle: formTitle
  };
  return formData;
}

function collectFormResponseData(formResponse) {
  var respondentEmail = '';
  var titleResponseList = [];
  var editResponseUrl = formResponse.getEditResponseUrl();
  var itemResponses = formResponse.getItemResponses();
  for (var i = 0; i < itemResponses.length; i++) {
    var itemResponse = itemResponses[i];
    var title = itemResponse.getItem().getTitle();
    var response = itemResponse.getResponse();
    if (title == 'Email') {
      respondentEmail = response
    }
    titleResponseList.push(title, ':\n', response, '\n\n');
  }
  var formResponseData = {
    respondentEmail: respondentEmail,
    titleResponseList: titleResponseList,
    editResponseUrl: editResponseUrl
  };
  return formResponseData
}

function collectData(form, formResponse) {
  var formData = collectFormData(form);
  var formResponseData = collectFormResponseData(formResponse);
  var effectiveUserEmail = Session.getEffectiveUser().getEmail();
  var emailBody = formResponseData.titleResponseList.concat(
      ['edit link:\n', formResponseData.editResponseUrl, '\n']).join('');
  var data = {
    formTitle: formData.formTitle,
    emailBody: emailBody,
    respondentEmail: formResponseData.respondentEmail,
    effectiveUserEmail: effectiveUserEmail
  };
  return data;
}

function emailFormCreator(data) {
  var recipient = data.effectiveUserEmail;
  var subject = ['Response: ', data.formTitle].join('');
  var body = [
    'someone responded to the form: ', data.formTitle, '\n',
    '\n',
    'they will be sent this email:\n',
    '\n',
    data.emailBody
  ].join('');
  MailApp.sendEmail(recipient, subject, body);
}

function emailRespondent(data) {
  var recipient = data.respondentEmail;
  var subject = ['Your response: ', data.formTitle].join('');
  var body = data.emailBody;
  MailApp.sendEmail(recipient, subject, body);
}

function emailOneOnFormSubmit(e) {
  var form = e.source;
  var formResponse = e.response;
  emailOne(form, formResponse);
}

function emailOne(form, formResponse) {
  var data = collectData(form, formResponse);
  emailFormCreator(data);
  emailRespondent(data);
}

function emailAll() {
  var form = FormApp.getActiveForm();
  var formResponses = form.getResponses();
  for (var i = 0; i < formResponses.length; i++) {
    var formResponse = formResponses[i];
    emailOne(form, formResponse);
  }
}

