import React from 'react';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import CloudUpload from 'material-ui/svg-icons/file/cloud-upload'
import axios from 'axios';
// import { FormattedMessage } from 'react-intl';

class HeaderPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {selectedFile: null};
		this.upload_data_click = this.upload_data_click.bind(this);		
	}

	upload_data_click = event => {
		this.setState({selectedFile: event.target.files[0]}, () => {
			const fd = new FormData();
			fd.append('userFile', this.state.selectedFile, this.state.selectedFile.name);
			axios.post('http://localhost:4000/upload', fd).then(res => {
				console.log(res);
				if(res.data.status === 'Sucessfully uploaded'){
					alert("Successfully uploaded");
				}else{
					alert("Fail uploaded");
				}
			})
		})
	}

	render() {
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
				<RaisedButton label="Upload" icon={<CloudUpload />} secondary={true} containerElement="label">
      				<input type="file" style={{ display: 'none' }} onChange={this.upload_data_click}/>
    			</RaisedButton>
			</div>
		);

		return (
			<div>
				<AppBar title="Spatial Decision Support System For Land Use Planning Assessment" 
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