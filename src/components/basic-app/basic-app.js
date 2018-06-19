import React from 'react';
import HeaderPanel from '../header-panel/header-panel';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import PropTypes from 'prop-types';
import ZoomButton from '../zoom-button/zoom-button';
import MapPanel from '../map-panel/map-panel'
import LayerButton from '../layer-button/layer-button'
import ol from 'openlayers';
import 'openlayers/css/ol.css'

//----------------------------------------------------------------------------------------------------
//Declare Map object
var map = new ol.Map({
	layers: [
		new ol.layer.Group({
			type: 'base-group',
			title: 'Base maps',
			layers: [
				new ol.layer.Tile({
					type: 'base',
					title: 'Streets',
					source: new ol.source.OSM(),
					visible: true,
				}),
				new ol.layer.Tile({
					type: 'base',
					title: 'Aerial',
					visible: false,
					source: new ol.source.XYZ({
						attributions: [
							new ol.Attribution({
								html: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
							})
						],
						url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
					})
				})
			]
		}),

	],
	controls: [],
	view: new ol.View({
		center: [11848350.880429, 1800909.818436], //OSM use EPGS:3857 - WGS 84 / Pseudo-Mercator - Spherical Mercator, Google Maps, OpenStreetMap, Bing, ArcGIS, ESRI
		zoom: 6
	})
});

//Add scale line
var scaleLineControl = new ol.control.ScaleLine({});
scaleLineControl.setUnits("metric");
map.addControl(scaleLineControl);

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
				<HeaderPanel/>
				<MapPanel map={map} />
				<ZoomButton map={map} />
				<LayerButton />
			</div>
		);
	}
}
export default BasicApp