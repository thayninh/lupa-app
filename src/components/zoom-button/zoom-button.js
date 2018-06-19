import React from 'react';
import { FormattedMessage } from 'react-intl';
import IconButton from 'material-ui/IconButton';
import ZoomIn from 'material-ui/svg-icons/action/zoom-in';
import ZoomOut from 'material-ui/svg-icons/action/zoom-out';
import './zoom-button.css'

class ZoomButton extends React.Component {
	constructor(props) {
		super(props);
		this.zoom_in_click = this.zoom_in_click.bind(this);
		this.zoom_out_click = this.zoom_out_click.bind(this);
	}
	zoom_in_click() {
		var map = this.props.map;
		var view = map.getView();
		var zoom = view.getZoom();
		view.setZoom(zoom + 1);
	}
	zoom_out_click() {
		var map = this.props.map;
		var view = map.getView();
		var zoom = view.getZoom();
		view.setZoom(zoom - 1);
	}

	render() {
		//console.log(this.props.map)
		var tooltipZoomIn = <FormattedMessage id="zoom-button.zoom-in" defaultMessage="Zoom in" />
		var tooltipZoomOut = <FormattedMessage id="zoom-button.zoom-out" defaultMessage="Zoom out" />
		const styles = {
			smallIcon: {
				width: 25,
				height: 25,
				color: "white",

			},
			small: {
				width: 40,
				height: 40,
				padding: 0,
			},
		}

		return (
			<div>
				<div id="zoom-in-icon" onClick={this.zoom_in_click}>
					<IconButton tooltip={tooltipZoomIn}
						iconStyle={styles.smallIcon}
						style={styles.small}
						tooltipPosition="top-center">
						<ZoomIn />
					</IconButton>
				</div >

				<div id="zoom-out-icon" onClick={this.zoom_out_click}>
					<IconButton tooltip={tooltipZoomOut}
						iconStyle={styles.smallIcon}
						style={styles.small}
						tooltipPosition="top-center">
						<ZoomOut />
					</IconButton>
				</div >
			</div>
		);
	}
}

export default ZoomButton