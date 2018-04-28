import React from 'react';
import './layer-button.css'
import ContentLayer from 'material-ui/svg-icons/maps/layers'
import { FormattedMessage } from 'react-intl';
import IconButton from 'material-ui/IconButton';

class LayerButton extends React.Component {

    render() {
        var tooltip_layer = <FormattedMessage id="layer-button.layer" defaultMessage="Layers" />
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
            <div id="layer-icon" >
                <IconButton tooltip={tooltip_layer}
                    iconStyle={styles.smallIcon}
                    style={styles.small}
                    tooltipPosition="top-center"
                    onClick={this.layer_click}>
                    <ContentLayer />
                </IconButton>
            </div >
        );
    }
}
export default LayerButton