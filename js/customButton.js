L.Control.CustomButton =  L.Control.extend({

  options: {
    position: 'topleft',
	text: '',
	link: ''
  },
  
   onAdd: function (map) {
	  
	var container = L.DomUtil.create('div', ' leaflet-bar leaflet-control leaflet-touch');
	container.innerHTML = '<a href="'+ this.options.link +'">' + this.options.text +'</a>'
	container.style.backgroundColor = 'white';
	
	return container;
  }
});

L.control.custombutton = function(opts) {
    return new L.Control.CustomButton(opts);
}