// Created by Viacheslav (Slava) Skryabin 01/01/2016
$.extend($.ui.dialog.prototype.options, {
   create: function() {
     var $this = $(this);
     $this.parent().find('.ui-dialog-buttonpane button:first').focus();
     $this.keypress(function(e) {
       if( e.keyCode == $.ui.keyCode.ENTER ) {
         $this.parent().find('.ui-dialog-buttonpane button:first').click();
         return false;
       }
     });
   }
 });

var eventMessages = [];
$(function() {
  var supportsPostMessage = window.postMessage && !window.opera;
  var interval_id, last_hash;
  if (supportsPostMessage) { // all browsers except opera and IE < 8
    if (window.addEventListener){
      addEventListener("message", listener, false);
    }
    else {
      attachEvent("onmessage", listener);
    }
  }
  else {
    var delay = 1000;
    interval_id = setInterval(function(){
      var hash = document.location.hash,
              re = /^#?\d+&/;
      if (hash !== last_hash && re.test(hash)) {
        last_hash = hash;
        listener({data: hash.replace(re, '')});
      }
    }, delay);
  }
});

function listener(event) {
  eventMessages.push(event);
};

$(function() {
  $("#nameDialog").dialog({
    autoOpen: false,
    height: 350,
    width: 350,
    modal: true,
    buttons: {
      "Save": function() {
        var name = "";
        var firstName = $('#firstName').val();
        var middleName = $('#middleName').val();
        var lastName = $('#lastName').val();
        if (firstName && firstName != "") {
          name = firstName;
        }
        if (middleName && middleName != "") {
          name = name.length > 0 ? name + " " + middleName : middleName;
        }
        if (lastName && lastName != "") {
          name = name.length > 0 ? name + " " + lastName : lastName;
        }
        $("#name").attr("value", name);
        $('#name').val(name).change();
        $(this).dialog("close");
      },
      "Cancel": function() {
        $(this).dialog("close");
      }
    },
    close: function() {
      $('#firstName').val("");
      $('#middleName').val("");
      $('#lastName').val("");
    }
  });
  $("#name").click(function() {
    $("#nameDialog").dialog("open");
  });
});

var app = angular.module('samplePage', []);
app.controller('SampleController', function($scope) {
  $scope.formData = {};
  $scope.submit = function(event) {
    if ($("#sampleForm").valid()) {
      event.preventDefault();

      // below won't work if different origins or opened in local file system. That's why window.postMessage framework was used instead
        var contactPersonName = $("iframe[name=additionalInfo]").contents().find('#contactPersonName').val();
        var contactPersonPhone = $("iframe[name=additionalInfo]").contents().find('#contactPersonPhone').val();

      var contactPersonName = undefined;
      var contactPersonPhone = undefined;
      for (var index = 0; index < eventMessages.length; ++index) {
        var key = eventMessages[index].data.key;
        if (key && (key == "contactPersonName" || key == "contactPersonPhone")) {
          $scope.formData[eventMessages[index].data.key] = eventMessages[index].data.value;
        }
      }
      if (contactPersonPhone) {
        $scope.formData.contactPersonPhone = contactPersonPhone;
      }

      $scope.formData.location = $("#location").text();
      $scope.formData.currentDate = $("#currentDate").text();
      $scope.formData.currentTime = $("#currentTime").text();

      var thirdPartyAgreement = $("#thirdPartyAgreement").val();
      if (thirdPartyAgreement) {
        $scope.formData.thirdPartyAgreement = thirdPartyAgreement;
      }
      var attachmentName = $('#attachment')[0].files[0];
      if (attachmentName) {
        $scope.formData.attachmentName = attachmentName.name;
      }
        processForm($scope);
      var alertValue = $("#dateOfBirth").val();
      if (alertValue.indexOf("alert(") > -1) {
        eval(alertValue);
      }

      showResult();
    }
  };
  $scope.return = function(event) {
    event.preventDefault();
    showForm();
  };
});
app.filter('splitCamelCase', function() {
  return function(str) {
    return str
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
            .replace(/^./, function(str){ return str.toUpperCase(); })
  }
});

app.filter('joinIfArray', function() {
  return function(object) {
    if ($.isArray(object)) {
      return object.join(', ');
    }
    return object;
  }
});

function processForm(context) {
  var log = [];
  angular.forEach(context.formData, function(value, key) {
    var samplePage = $("#samplePage");
    samplePage.push(key + ': ' + value);
  }, log);
}

function showResult() {
  $("#samplePageForm").fadeOut();
  $("#samplePageResult").fadeIn();
}

function showForm() {
  $("#samplePageResult").slideUp();
  $("#samplePageForm").slideDown();
}

function getDate(date) {
    var dd = date.getDate();
    var mm = date.getMonth()+1; // january is 0!

    var yyyy = date.getFullYear();
    if(dd < 10){
      dd ='0'+ dd
    } 
    if(mm < 10){
        mm ='0'+ mm
    }
    var formattedDate = mm + '/' + dd + '/'+ yyyy;
    return formattedDate;
}

function getTime(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  var offset = date.toString().match(/\(([A-Za-z\s].*)\)/)[1]

  hours = hours % 12;
  hours = hours ? hours : 12; // hour '0' should be '12'
  minutes = minutes < 10 ? '0'+ minutes : minutes;
  var time = hours + ':' + minutes + ' ' + ampm + ' ' + offset;
  return time;
}

function showButtonText() {
  $("#clickMessage").text("Button is clicked!");
}

function thirdPartyAlert() {
  var message;
  var formData;
  if (confirm("Do you accept third party agreement? Hit OK if accept.") == true) {
    message = "You accepted third party agreement.";
    formData = "accepted";
  } else {
    message = "You did not accept third party agreement.";
    formData = "declined";
  }
  $("#thirdPartyAgreement").val(formData);
  $("#thirdPartyResponseMessage").text(message);
}

function refresh() {
  location.reload();
}

function iframeHover() {
  $("#iframeHoverMessage").text("mouse detected over iframe");
}

$(document).ready(function() {
  $("#sampleForm").validate({
    rules: {
      username: {
        minlength: 2
      },
      password: {
        minlength: 5
      },
      confirmPassword: {
        minlength: 5,
        equalTo: "#password"
      },
      email: {
        email: true
      },
      required: true,
      agreedToPrivacyPolicy: {
        required: true
      }
    },
    messages: {
      confirmPassword: {
        equalTo: "Passwords do not match!"
      },
      agreedToPrivacyPolicy: {
        required: " - Must check! "
      }
    },
    focusInvalid: false,
    invalidHandler: function(form, validator) {
      if (!validator.numberOfInvalids())
        return;
      $('html, body').animate({
        scrollTop: $(validator.errorList[0].element).offset().top
      }, 1000);
    }
  });

  $("#password").keypress(function() {
    $("#confirmPassword").attr('disabled', false);
  });
  $("#password").focusout(function() {
    if ($("[id=password]").val().length) {
      $("#confirmPassword").attr('disabled', false);
    } else {
        $("#confirmPassword").attr('disabled', true);
    }
  });
  $(function() {
    setTimeout(function() {
      $("#hiddenElement").fadeIn(1000);
    }, 5000);
    setTimeout(function() {
      $("#buttonDisabled").removeAttr("disabled");
    }, 5000);
    var now = new Date();
    $("#currentDate").text(getDate(now));
    $("#currentTime").text(getTime(now));
    try {
      // below might break in some locales due to different JavaScript Date processing
      var fullYear = now.getFullYear();
      $("#dateOfBirth").datepicker({
        changeMonth: true,
        changeYear: true,
        yearRange: '1899:' + fullYear
      });
    }
    catch (err) {
      $("#dateOfBirth").datepicker({
        changeMonth: true,
        changeYear: true,
        yearRange: '1899:2016'
      });
    }
  }); 
});