L.Control.CustomButtonDonate =  L.Control.extend({

  options: {
    position: 'topright',
    country: '',
    link: ''
  },
  
   onAdd: function (map) {
	  
	var container = L.DomUtil.create('div', 'leaflet-control');
  container.innerHTML = '<div>'  +
  '<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">'+
  '<input type="hidden" name="cmd" value="_s-xclick" />'  +
  '<input type="hidden" name="hosted_button_id" value="EXJ589YFSQD2N" />'  +
  '<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" border="0" name="submit" title="Páči sa Vám tento projekt? Prispejte na jeho fungovanie a další vývoj!" alt="Donate with PayPal button" />' +
  '<img alt="" border="0" src="https://www.paypal.com/en_SK/i/scr/pixel.gif" width="1" height="1" /> '+
  '</form> '+
  '</div>';
	
	return container;
  }
});

L.control.CustomButtonDonate = function(opts) {
    return new L.Control.CustomButtonDonate(opts);
}