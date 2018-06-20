import React from 'react';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import CloudUpload from 'material-ui/svg-icons/file/cloud-upload'
import Explore from 'material-ui/svg-icons/action/explore'
import axios from 'axios';
import qs from 'qs';
import Dialog from 'material-ui/Dialog';
import CircularProgress from 'material-ui/CircularProgress';
// import { FormattedMessage } from 'react-intl';
const customContentStyle = {
	width: '25%',
	maxWidth: 'none',
  };
class HeaderPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {selectedFile: null, uuid: null, open: false};
		this.upload_data_click = this.upload_data_click.bind(this);
		this.process_click = this.process_click.bind(this);		
	}

	upload_data_click = event => {
		this.setState({open: true});
		this.setState({selectedFile: event.target.files[0]}, () => {
			const fd = new FormData();
			fd.append('userFile', this.state.selectedFile, this.state.selectedFile.name);
			axios.post('http://localhost:4000/upload', fd).then(res => {
				if(res.data.status === 'Sucessfully uploaded'){
					this.setState({open: false});
					this.setState({uuid: res.data.uuid}, () => {
						alert("Successfully uploaded");
					})
				}else if(res.data.status === 'Fail uploaded'){
					this.setState({open: false}, () => {
						alert("Fail uploaded");
					});
				}
			})
		})
	}

	process_click = () =>{
		this.setState({open: true});
		const fd = new FormData();
		axios.post('http://localhost:4000/process', qs.stringify({uuid: this.state.uuid})).then(res => {
			if(res.data.status === 'Sucessfully processed'){
				alert("Successfully processed");
			}else if(res.data.status === 'Fail processed'){
				alert("Fail processed");
			}
		});
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
				
				<RaisedButton label="Process" icon={<Explore />} secondary={true} style={{marginLeft:12}} onClick={this.process_click}>      				
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
				<Dialog
					modal={true}
					open={this.state.open}
					contentStyle={customContentStyle}
					>
					<CircularProgress size={80} thickness={5}>Processing........ </CircularProgress>
        		</Dialog>
			</div >
		);
	}
}

export default HeaderPanel