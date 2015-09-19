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

  // Get query variables
  function getQueryParam(variable, defaultValue) {
    // Find all URL parameters
    var query = location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');

      // If the query variable parameter is found, decode it to use and return it for use
      if (pair[0] === variable) {
        return decodeURIComponent(pair[1]);
      }
    }
    return defaultValue || false;
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
        var returnTo = getQueryParam('return_to', 'pebblejs://close#');
        document.location = returnTo + encodeURIComponent(JSON.stringify(settings));
      }
    });
  });
})(jQuery);
