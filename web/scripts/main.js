(function ($) {
  'use strict';

  var $configurationUrl = $('#configurationUrl');

  function validateSettings() {
    var $alert = $('#warningConfiguration').html('').hide();
    var errors = [];
    var settings = {
      configurationUrl: $configurationUrl.val()
    };
    if (!(settings.configurationUrl && settings.configurationUrl.match(/^https?:\/\//))) {
      errors.push('invalid url');
    }
    if (errors.length) {
      $alert.show().html(errors.join('<br/>'));
      return null;
    }
    return settings;
  }

  $(document).ready(function () {
    $configurationUrl.val(localStorage.getItem('configurationUrl'));
    // overwrite by debugSettings
    if (window.debugSettings) {
      if (window.debugSettings.configurationUrl) {
        $configurationUrl.val(window.debugSettings.configurationUrl);
      }
    }

    $('#saveButton').click(function () {
      var settings = validateSettings();
      if (settings) {
        localStorage.setItem('configurationUrl', settings.configurationUrl);
        var location = 'pebblejs://close#' + encodeURIComponent(JSON.stringify(settings));
        console.log('Warping to: ' + location);
        document.location = location;
      }
    });
  });
})(jQuery);
