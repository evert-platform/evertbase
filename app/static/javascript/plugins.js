$(document).ready(function(){
            var $disabled_select = $('select#select_disabled').children('option');
            var $enabled_select = $('select#select_enabled').children('option');

            var $enable_button = $('input#enable');
            var $disable_button = $('input#disable');

            if ($disabled_select.html() == 'All plugins enabled'){
                $($disabled_select.parent()).attr('disabled', true);
                $($enable_button).attr('disabled', true);
            }

            else if ($enabled_select.html() == 'No active plugins'){
                $($enabled_select.parent()).attr('disabled', true);
                $($disable_button).attr('disabled', true);
            }

        });

        $(function() {
			  $('input#enable').on('click', function() {
				$.getJSON('/_enable_plugin', {
				  enableplugins: $('select[id="select_disabled"]').val()
				}, function(data) {
				});
				return false;
			  });
			});

        $(function() {
			  $('input#disable').on('click', function() {
				$.getJSON('/_disable_plugin', {
				  disableplugins: $('select[id="select_enabled"]').val()
				}, function(data) {
				});
				return false;
			  });
			});
