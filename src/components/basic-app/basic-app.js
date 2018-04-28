import React from 'react';
import HeaderPanel from '../header-panel/header-panel';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import PropTypes from 'prop-types';
import ZoomButton from '../zoom-button/zoom-button';
import MapPanel from '../map-panel/map-panel'
import LayerButton from '../layer-button/layer-button'
import ol from 'openlayers';

//----------------------------------------------------------------------------------------------------
var map = new ol.Map({
	layers: [
		new ol.layer.Tile({
			source: new ol.source.OSM()
		})
	],
	controls: ol.control.defaults({
		attributionOptions: {
			collapsible: false
		}
	}),
	view: new ol.View({
		center: [0, 0],
		zoom: 2
	})
});

//---------------------------------------------------------------------------------------------------------

class BasicApp extends React.Component {
	//Refer to this link for more information: https://medium.com/differential/react-context-and-component-coupling-86e535e2d599
	static childContextTypes = {
		muiTheme: PropTypes.object,
	}
	getChildContext = () => {
		return {
			muiTheme: getMuiTheme()
		};
	}

	render() {
		return (
			<div id='content'>
				<HeaderPanel />
				<MapPanel map={map} />
				<ZoomButton map={map} />
				<LayerButton />
			</div>
		);
	}
}
export default BasicApp