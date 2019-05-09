L.Control.HelpInfoButton =  L.Control.extend({

  options: {
    position: 'topright',
	  text: ''
  },
  
   onAdd: function (map) {
	  
  var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-touch');
  //container.innerHTML = '<a id= "help" style="line-height:25px"><img src="../question-solid.svg" width="30px" height="30px"></a>'
	container.innerHTML = '<a id= "help" style="line-height:25px">' + this.options.text +'</a>'
	container.style.backgroundColor = 'white';
	
	return container;
  }
});

L.control.HelpInfoButton = function(opts) {
    return new L.Control.HelpInfoButton(opts);
}