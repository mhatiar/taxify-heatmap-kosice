L.Control.CustomButtonUser =  L.Control.extend({

  options: {
    position: 'topright',
  },
  
   onAdd: function (map) {
	  
	var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-touch');
  container.innerHTML = '<a id= "profile" style="line-height:25px" title="Profil"><span class="glyphicon glyphicon-user"></span></a>'
  container.style.backgroundColor = 'white';
	
	return container;
  }
});

L.control.CustomButtonUser = function(opts) {
    return new L.Control.CustomButtonUser(opts);
}