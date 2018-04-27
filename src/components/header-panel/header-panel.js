import React from 'react';
import AppBar from 'material-ui/AppBar';
// import { FormattedMessage } from 'react-intl';

class HeaderPanel extends React.Component {

	render() {

		// var tooltip = <FormattedMessage id="greeting" description="" defaultMessage="" />
		const styles = {
			appHeight: {
				height: 50
			},
			titleHeight: {
				height: 50,
				'line-height': 50
			}
		}

		const rightButtons = (
			<div>
				{/* <IconButton tooltip={tooltip}>
					<ActionHome />
				</IconButton> */}
			</div>
		);

		return (
			<div>
				<AppBar title="DOLI - GIS" 
					showMenuIconButton={false} 
					iconElementRight={rightButtons} 
					style={styles.appHeight} 
					titleStyle={styles.titleHeight}
					/>
			</div >
		);
	}
}

export default HeaderPanel