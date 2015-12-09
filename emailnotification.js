function onOpen() {
  var form = FormApp.getActiveForm();
  ScriptApp.newTrigger('emailConfirmationToRespondent')
      .forForm(form)
      .onFormSubmit()
      .create();
}

function titleResponseIterator(formResponse) {
  var itemResponses = formResponse.getItemResponses();
  var index = 0;
  var iterator = {
    next: function() {
      if (index < itemResponses.length) {
        var itemResponse = itemResponses[index];
        index++;
        var title = itemResponse.getItem().getTitle();
        var response = itemResponse.getResponse();
        return {value: {title: title, response: response}, done: false};
      } else {
        return {done: true};
      }
    }
  }
  return iterator;
}

function processTitleResponse(formResponse) {
  var respondentEmail = '';
  var emailBodyList = [];
  var iterator = titleResponseIterator(formResponse);
  var titleResponse = iterator.next();
  while (!titleResponse.done) {
    title = titleResponse.value.title;
    response = titleResponse.value.response;
    if (title == 'Email') {
      respondentEmail = response
    }
    emailBodyList.push(title, ':\n', response, '\n\n');
    titleResponse = iterator.next();
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

