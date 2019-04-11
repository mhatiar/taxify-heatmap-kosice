L.Control.CustomButtonCountry =  L.Control.extend({

  options: {
    position: 'topright',
    country: '',
    link: ''
  },
  
   onAdd: function (map) {
	  
	var container = L.DomUtil.create('div', 'leaflet-control');
  container.innerHTML = '<a style="line-height:25px" href="'+ this.options.link +'"><img src="'+ this.options.country +'" width="30px" height="30px"></a>'
  //container.style.backgroundColor = 'white';
	
	return container;
  }
});

L.control.CustomButtonCountry = function(opts) {
    return new L.Control.CustomButtonCountry(opts);
}