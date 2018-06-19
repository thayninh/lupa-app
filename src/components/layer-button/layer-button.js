import React from 'react';
import './layer-button.css'
import ContentLayer from 'material-ui/svg-icons/maps/layers'
import { FormattedMessage } from 'react-intl';
import IconButton from 'material-ui/IconButton';
import LayerPanel from '../layer-panel/layer-panel'

class LayerButton extends React.Component {
	constructor(props) {
		super(props);
		this.state = { layerPanelState: false };
		this.layer_click = this.layer_click.bind(this);
	}

	layer_click() {
		this.setState({ layerPanelState: !this.state.layerPanelState })
	}

	show_layer_panel() {
		if (this.state.layerPanelState) {
			return <LayerPanel />;
		} else {
			return null;
		}
	}

	render() {
		var tooltipLayer = <FormattedMessage id="layer-button.layer" defaultMessage="Layers" />
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
				<div id="layer-icon" >
					<IconButton tooltip={tooltipLayer}
						iconStyle={styles.smallIcon}
						style={styles.small}
						tooltipPosition="top-center"
						onClick={this.layer_click}>
						<ContentLayer />
					</IconButton>
				</div >
				{this.show_layer_panel()}
			</div>

		);
	}
}
export default LayerButton