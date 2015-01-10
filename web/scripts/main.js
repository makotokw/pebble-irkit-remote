(function($){
  'use strict';

  $(document).ready(function () {

    var $alert = $('#warningConfiguration');

    /**
     * @param {String} url
     */
    function validateUserConfiguration(url) {
      $.getJSON(url, function (config) {
        var errors = [];
        if (!($.type(config.clientKey) === 'string' && config.clientKey.length > 0)) {
          errors.push('clientKey is not found');
        }
        if (!($.type(config.deviceId) === 'string' && config.deviceId.length > 0)) {
          errors.push('deviceId is not found');
        }
        if (!($.isArray(config.commands) && config.commands.length > 0)) {
          errors.push('commands is not found');
        }
        if (errors.length) {
          $alert.show().html(errors.join('<br/>'));
        } else {
          $alert.html('').hide();
        }
      })
      .error(function(/*xhr, textStatus, errorThrown*/) {
          $alert.show().html('can not fetch url');
      });
    }

    $('#saveButton').click(function(){
      var configuration = {
          userConfigUrl: $('#configurationUrl').val()
      };
      validateUserConfiguration(configuration.userConfigUrl);
    });
  });
})(jQuery);
