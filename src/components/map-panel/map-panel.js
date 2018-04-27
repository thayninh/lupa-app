import React from 'react';

class MapPanel extends React.Component {
	componentDidMount(){
		var map = this.props.map;
		map.setTarget('map');
	}
	render() {
		return (
			<div id='map' />
		);
	}
}

export default MapPanel