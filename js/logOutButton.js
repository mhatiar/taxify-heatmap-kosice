L.Control.CustomButtonLogout =  L.Control.extend({

  options: {
    position: 'topright',
  },
  
   onAdd: function (map) {
	  
	var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-touch');
  container.innerHTML = '<a style="line-height:25px" title="Odhlásiť sa" href="/users/logout"><span class="glyphicon glyphicon-log-out"></span></a>'
  container.style.backgroundColor = 'white';
	
	return container;
  }
});

L.control.CustomButtonLogout = function(opts) {
    return new L.Control.CustomButtonLogout(opts);
}